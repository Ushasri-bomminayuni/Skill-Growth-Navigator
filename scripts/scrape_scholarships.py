#!/usr/bin/env python3
"""
Scholarship Scraper
Scrapes scholarship opportunities from various sources and saves them to Firebase
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

def scrape_scholarships():
    """Scrape scholarship opportunities from various sources"""
    opportunities = []

    # Scrape from Fastweb
    fastweb_opps = scrape_fastweb()
    opportunities.extend(fastweb_opps)

    # Scrape from Scholarships.com
    scholarscom_opps = scrape_scholarships_com()
    opportunities.extend(scholarscom_opps)

    return opportunities

def scrape_fastweb():
    """Scrape scholarships from Fastweb"""
    opportunities = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Search for scholarships
        page.goto("https://www.fastweb.com/college-scholarships")
        time.sleep(3)

        # Get scholarship cards
        scholarship_cards = page.query_selector_all(".scholarship-card")

        for card in scholarship_cards:
            try:
                title = card.query_selector(".scholarship-title").inner_text().strip()
                organization = card.query_selector(".scholarship-sponsor").inner_text().strip()
                amount = card.query_selector(".scholarship-amount").inner_text().strip()
                deadline_text = card.query_selector(".scholarship-deadline").inner_text().strip()

                # Parse deadline
                deadline = parse_deadline(deadline_text)

                # Create opportunity object
                opportunity = {
                    "title": title,
                    "organization": organization,
                    "category": "Scholarships",
                    "description": f"Scholarship worth {amount} offered by {organization}",
                    "skills_required": ["Academic", "Scholarship"],
                    "location": "United States",
                    "apply_link": "https://www.fastweb.com",  # Will be updated with actual link
                    "deadline": deadline.isoformat(),
                    "verified": False,
                    "source": "Fastweb",
                    "createdAt": datetime.now().isoformat(),
                    "updatedAt": datetime.now().isoformat(),
                    "metadata": {
                        "amount": amount
                    }
                }

                opportunities.append(opportunity)

            except Exception as e:
                print(f"Error processing Fastweb scholarship: {e}")
                continue

        browser.close()

    return opportunities

def scrape_scholarships_com():
    """Scrape scholarships from Scholarships.com"""
    opportunities = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Search for scholarships
        page.goto("https://www.scholarships.com/financial-aid/college-scholarships/")
        time.sleep(3)

        # Get scholarship listings
        scholarship_listings = page.query_selector_all(".scholarship-listing")

        for listing in scholarship_listings:
            try:
                title = listing.query_selector(".scholarship-title a").inner_text().strip()
                organization = listing.query_selector(".scholarship-sponsor").inner_text().strip()
                amount = listing.query_selector(".scholarship-amount").inner_text().strip()
                deadline_text = listing.query_selector(".scholarship-deadline").inner_text().strip()
                apply_link = listing.query_selector(".scholarship-title a").get_attribute("href")

                # Parse deadline
                deadline = parse_deadline(deadline_text)

                # Create opportunity object
                opportunity = {
                    "title": title,
                    "organization": organization,
                    "category": "Scholarships",
                    "description": f"Scholarship worth {amount} offered by {organization}",
                    "skills_required": ["Academic", "Scholarship"],
                    "location": "United States",
                    "apply_link": apply_link,
                    "deadline": deadline.isoformat(),
                    "verified": False,
                    "source": "Scholarships.com",
                    "createdAt": datetime.now().isoformat(),
                    "updatedAt": datetime.now().isoformat(),
                    "metadata": {
                        "amount": amount
                    }
                }

                opportunities.append(opportunity)

            except Exception as e:
                print(f"Error processing Scholarships.com listing: {e}")
                continue

        browser.close()

    return opportunities

def parse_deadline(deadline_text):
    """Parse deadline text into datetime object"""
    try:
        # Example: "Deadline: Jun 15, 2023"
        if "Deadline:" in deadline_text:
            date_str = deadline_text.replace("Deadline:", "").strip()
            return datetime.strptime(date_str, "%b %d, %Y")
        elif "Deadline" in deadline_text:
            date_str = deadline_text.replace("Deadline", "").strip()
            return datetime.strptime(date_str, "%m/%d/%Y")
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
    print("Starting scholarship scraping...")
    opportunities = scrape_scholarships()
    print(f"Found {len(opportunities)} opportunities")

    if opportunities:
        save_to_firestore(opportunities)
        print("Scraping completed successfully!")
    else:
        print("No opportunities found.")