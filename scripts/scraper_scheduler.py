#!/usr/bin/env python3
"""
Scraper Scheduler
Runs scraping scripts on a schedule and manages the scraping pipeline
"""

import os
import time
import schedule
import sys
import subprocess
from datetime import datetime

def run_scraper(script_name):
    """Run a scraping script"""
    print(f"[{datetime.now()}] Starting {script_name}...")
    
    # Get the directory of the current script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    script_path = os.path.join(current_dir, script_name)
    
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            check=True,
            capture_output=True,
            text=True
        )
        print(f"[{datetime.now()}] {script_name} completed successfully")
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"[{datetime.now()}] {script_name} failed with error:")
        print(e.stderr)

def run_all_scrapers():
    """Run all scraping scripts"""
    print(f"[{datetime.now()}] Running all scrapers...")

    # Run LinkedIn scraper
    run_scraper("scrape_linkedin.py")

    # Run Devpost scraper
    run_scraper("scrape_devpost.py")

    # Run Scholarship scraper
    run_scraper("scrape_scholarships.py")

    print(f"[{datetime.now()}] All scrapers completed")

def schedule_scrapers():
    """Schedule scrapers to run every 6 hours"""
    # Run immediately
    run_all_scrapers()

    # Schedule to run every 6 hours
    schedule.every(6).hours.do(run_all_scrapers)

    print("Scrapers scheduled to run every 6 hours")

    # Keep the script running
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

if __name__ == "__main__":
    print("Starting scraper scheduler...")
    schedule_scrapers()