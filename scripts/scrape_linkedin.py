#!/usr/bin/env python3
"""
LinkedIn Internship Scraper
Scrapes internship opportunities from LinkedIn and saves them to Firebase
"""

import os
import json
import time
import requests
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

def scrape_linkedin_internships(search_query="internship", location="United States", pages=5):
    """Scrape internship opportunities from LinkedIn"""
    opportunities = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Login to LinkedIn (if needed)
        # page.goto("https://www.linkedin.com/login")
        # page.fill("#username", os.getenv("LINKEDIN_USERNAME"))
        # page.fill("#password", os.getenv("LINKEDIN_PASSWORD"))
        # page.click("button[type='submit']")
        # time.sleep(5)  # Wait for login to complete

        for page_num in range(1, pages + 1):
            url = f"https://www.linkedin.com/jobs/search/?keywords={search_query}&location={location}&f_TPR=r2592000&start={(page_num - 1) * 25}"
            page.goto(url)
            time.sleep(3)  # Wait for page to load

            # Scroll to load all jobs
            for _ in range(3):
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                time.sleep(1)

            # Get job listings
            job_cards = page.query_selector_all(".job-card-list__title")

            for card in job_cards:
                try:
                    title = card.inner_text().strip()

                    # Click on job card to get details
                    card.click()
                    time.sleep(1)

                    # Extract job details
                    company = page.query_selector(".job-details-jobs-unified-top-card__company-name a").inner_text().strip()
                    location = page.query_selector(".job-details-jobs-unified-top-card__primary-description span:last-child").inner_text().strip()
                    description = page.query_selector(".jobs-description-content__text").inner_text().strip()
                    apply_link = page.query_selector(".jobs-apply-button--top-card button").get_attribute("data-tracking-control-name")

                    # Extract skills (if available)
                    skills = []
                    skills_elements = page.query_selector_all(".job-details-skill-match-status-list__skill-pill")
                    for skill in skills_elements:
                        skills.append(skill.inner_text().strip())

                    # Create opportunity object
                    opportunity = {
                        "title": title,
                        "organization": company,
                        "category": "Internships",
                        "description": description,
                        "skills_required": skills,
                        "location": location,
                        "apply_link": apply_link or f"https://www.linkedin.com/jobs/view/{title.replace(' ', '-')}-at-{company.replace(' ', '-')}",
                        "deadline": datetime.now().replace(year=datetime.now().year + 1).isoformat(),  # Default to 1 year from now
                        "verified": False,
                        "source": "LinkedIn",
                        "createdAt": datetime.now().isoformat(),
                        "updatedAt": datetime.now().isoformat()
                    }

                    opportunities.append(opportunity)

                except Exception as e:
                    print(f"Error processing job card: {e}")
                    continue

        browser.close()

    return opportunities

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
    print("Starting LinkedIn scraping...")
    opportunities = scrape_linkedin_internships()
    print(f"Found {len(opportunities)} opportunities")

    if opportunities:
        save_to_firestore(opportunities)
        print("Scraping completed successfully!")
    else:
        print("No opportunities found.")