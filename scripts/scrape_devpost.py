#!/usr/bin/env python3
"""
Devpost Hackathon Scraper
Scrapes hackathon opportunities from Devpost and saves them to Firebase
"""

import os
import json
import time
from datetime import datetime
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from firebase_admin import initialize_app, credentials, firestore

# Initialize Firebase
def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    service_account_info = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    
    if service_account_info:
        try:
            # Parse the JSON string
            import json
            cert_dict = json.loads(service_account_info)
            cred = credentials.Certificate(cert_dict)
            print("Initialized Firebase using environment variable")
        except Exception as e:
            print(f"Error parsing FIREBASE_SERVICE_ACCOUNT_JSON: {e}")
            # Fallback
            cred = credentials.Certificate("path/to/firebase-service-account.json")
    else:
        # Fallback to local file for development
        cert_path = "path/to/firebase-service-account.json"
        if os.path.exists(cert_path):
            cred = credentials.Certificate(cert_path)
            print(f"Initialized Firebase using local file: {cert_path}")
        else:
            print("Warning: Firebase service account not found. Firestore operations will fail.")
            return None

    try:
        return initialize_app(cred)
    except Exception as e:
        # App might already be initialized
        from firebase_admin import get_app
        try:
            return get_app()
        except:
             print(f"Failed to initialize Firebase: {e}")
             return None

firebase_app = initialize_firebase()
db = firestore.client() if firebase_app else None

def scrape_devpost_hackathons(pages=5):
    """Scrape hackathon opportunities from Devpost"""
    opportunities = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        for page_num in range(1, pages + 1):
            url = f"https://devpost.com/hackathons?page={page_num}"
            page.goto(url)
            time.sleep(3)  # Wait for page to load

            # Get hackathon cards
            hackathon_cards = page.query_selector_all(".hackathon-card")

            for card in hackathon_cards:
                try:
                    title = card.query_selector(".title a").inner_text().strip()
                    organization = card.query_selector(".organization").inner_text().strip()
                    location = card.query_selector(".location").inner_text().strip()
                    deadline_text = card.query_selector(".date-range").inner_text().strip()

                    # Parse deadline
                    deadline = parse_deadline(deadline_text)

                    # Get hackathon URL
                    hackathon_url = card.query_selector(".title a").get_attribute("href")

                    # Visit hackathon page for more details
                    page.goto(hackathon_url)
                    time.sleep(2)

                    # Extract description
                    description = page.query_selector(".software-description").inner_text().strip()

                    # Extract prizes (if available)
                    prizes = []
                    prize_elements = page.query_selector_all(".prize-amount")
                    for prize in prize_elements:
                        prizes.append(prize.inner_text().strip())

                    # Create opportunity object
                    opportunity = {
                        "title": title,
                        "organization": organization,
                        "category": "Hackathons",
                        "description": description,
                        "skills_required": ["Hackathon", "Coding", "Teamwork"],  # Default skills
                        "location": location,
                        "apply_link": hackathon_url,
                        "deadline": deadline.isoformat(),
                        "verified": False,
                        "source": "Devpost",
                        "createdAt": datetime.now().isoformat(),
                        "updatedAt": datetime.now().isoformat(),
                        "metadata": {
                            "prizes": prizes
                        }
                    }

                    opportunities.append(opportunity)

                    # Go back to listings page
                    page.go_back()
                    time.sleep(2)

                except Exception as e:
                    print(f"Error processing hackathon card: {e}")
                    continue

        browser.close()

    return opportunities

def parse_deadline(deadline_text):
    """Parse deadline text into datetime object"""
    try:
        # Example: "Submissions close Jun 15, 2023"
        if "Submissions close" in deadline_text:
            date_str = deadline_text.replace("Submissions close", "").strip()
            return datetime.strptime(date_str, "%b %d, %Y")
        elif "Ends in" in deadline_text:
            # Example: "Ends in 2 days"
            days = int(deadline_text.split()[2])
            return datetime.now().replace(day=datetime.now().day + days)
        else:
            # Default to 3 months from now
            return datetime.now().replace(month=datetime.now().month + 3)
    except:
        return datetime.now().replace(month=datetime.now().month + 3)

def save_to_firestore(opportunities):
    """Save opportunities to Firestore"""
    for opportunity in opportunities:
        try:
            # Check if opportunity already exists
            query = db.collection("opportunities").where("title", "==", opportunity["title"]).where("organization", "==", opportunity["organization"]).limit(1)
            existing = list(query.stream())

            if not existing:
                # Add new opportunity
                db.collection("opportunities").add(opportunity)
                print(f"Added opportunity: {opportunity['title']}")
            else:
                print(f"Opportunity already exists: {opportunity['title']}")

        except Exception as e:
            print(f"Error saving opportunity to Firestore: {e}")

if __name__ == "__main__":
    print("Starting Devpost scraping...")
    opportunities = scrape_devpost_hackathons()
    print(f"Found {len(opportunities)} opportunities")

    if opportunities:
        save_to_firestore(opportunities)
        print("Scraping completed successfully!")
    else:
        print("No opportunities found.")