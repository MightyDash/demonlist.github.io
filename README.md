# Moik's Demon List

Moik's Demon List is a personal Geometry Dash demon tracker built around a Google Spreadsheet and a custom website. The spreadsheet acts as the main source of truth for every demon I have beaten, while the website presents that data in a polished, list-style layout inspired by sites like Pointercrate and the Insane Demon List.

## Project Overview

This project was made to keep my demon completions organized, automatically updated, and easy to show on a public website.

The system is split into two parts:

1. **Google Spreadsheet + Apps Script**
2. **Frontend Website**

The spreadsheet stores all demon data, and the Apps Script handles automation such as fetching information from GDDL, updating tiers, sorting placements, and storing changes in history. The website then fetches that processed data from the Apps Script web endpoint and displays it in a cleaner, more visual format.

## Spreadsheet Features

The Google Spreadsheet is the core of the project and contains my full demon list.

Each entry includes information such as:
- Placement
- Demon name
- Creator(s)
- Level ID
- Difficulty
- Attempt count
- Year beaten
- GDDL tier
- Tier change

The sheet is not just a static list. It includes a full Apps Script system that automates most of the work for me.

### Apps Script functionality
- Fetches demon metadata and GDDL tier data from the GDDL API
- Updates demon information in batches or individually
- Sorts demons automatically by GDDL tier
- Recalculates placements after updates
- Stores placement movement in a history sheet
- Supports adding and removing demons
- Uses a cache system to reduce unnecessary API requests
- Tracks request usage through a system sheet
- Exposes the sheet data as JSON for the website

Because of this setup, the spreadsheet functions like a lightweight database and management panel for the list.

## Website Features

The website is a custom frontend for the demon list that reads data from the Apps Script JSON endpoint.

It is designed to feel closer to a real demon-list website rather than a spreadsheet viewer.

### Website functionality
- Fetches live demon data from the spreadsheet
- Displays the list in ranked order
- Splits the list into:
  - Main List
  - Extended List
  - Legacy List
- Supports searching by demon name, creator, or level ID
- Supports filtering by difficulty
- Supports multiple sort options
- Displays thumbnails for demons from a local thumbnail folder
- Displays custom difficulty face images from a local faces folder
- Opens a detailed popup when a demon is clicked
- Stores personal notes locally in the browser
- Uses a themed gold/dark visual style inspired by demon list websites

## Data Flow

The project works like this:

1. Demon data is maintained in the Google Spreadsheet
2. Apps Script updates and organizes the sheet
3. Apps Script publishes the processed list as JSON
4. The website fetches that JSON
5. The frontend renders the list and details visually

This makes it easy to keep the website updated without manually editing website content every time the sheet changes.

## Goal of the Project

The goal of this project is to create a personal, automated demon archive that is both practical for tracking progress and visually appealing to browse.

Instead of only keeping completions in a spreadsheet, this project turns the list into a proper showcase site with live data, ranking sections, thumbnails, and demon detail popups.
