Sharda Palace — Complete User Guide
Getting Started (No Backend Server Needed)
The website runs entirely in the browser — there is no local server to start. Open the live site:

Public website: https://lokgenius-hub.github.io/mysharda
Admin panel: https://lokgenius-hub.github.io/mysharda/admin

For a local demo (no internet needed for admin): run npm run dev inside the sharda folder, then visit http://localhost:3000/mysharda/admin

Admin login credentials:

Email: admin@shardapalace.in
Password: Rohit@94304325
Module 1 — POS Terminal
Path: Admin → POS (lightning icon in sidebar)

Step-by-step: Taking a Food Order
Go to Admin → POS
On the left panel, you see the menu grid. Use the category tabs (Starters / Main Course / Breads etc.) or the search bar to find items
Click any item to add it to the cart (right panel)
In the cart, use + / − buttons to change quantity; click the trash icon to remove an item
At the top of the cart, select order type:
Dine In → also type the table name (e.g. T-4)
Takeaway
Delivery
Select payment mode: Cash / UPI / Card / Split / Credit-Room
Click the green Pay ₹{amount} button
How to Print the Bill
After clicking Pay, a "Last Bill" bar appears at the bottom of the cart with the order number and total.

Click the printer icon in that bar → a bill popup opens → your browser's print dialog appears automatically.

The printed bill includes:

Business name + GST No
Date and time, order number, order type, table name
All items with quantity and price
Subtotal + CGST + SGST + Total
Payment mode
"Thank you! Visit Again 🙏"
Hotel Guest eats food — how to charge their room?
Take the food order normally in POS
For order type, select Dine In and enter the room number as the table name (e.g. Room 205)
For payment mode, select Credit / Room
Click Pay — the order is recorded against that room name
Print the bill → hand it to the guest at checkout time
Offline Mode
If the internet drops, orders are saved locally in the browser (IndexedDB). A Sync counter appears at the top of POS. When internet returns, click Sync or it syncs automatically.

Module 2 — How to Change Google Maps Location
Path: Admin → Site Config (settings icon, near bottom of sidebar)

Open the Site Config page
Scroll to the 📍 Location & Maps section
Find the Google Maps Embed field — this is the long URL from Google Maps
To get the new embed URL:
Go to maps.google.com
Search for the hotel/location
Click Share → Embed a map → Copy the src="..." value from the iframe code (just the URL, not the full HTML tag)
Paste that URL into the Google Maps Embed field
Also update Google Maps Link — this is the simple link used for "Get Directions" button
Click Save on each field
The new map appears on the public website within 1 minute (cache refreshes automatically)
Module 3 — How to Change Images on Any Page
Path: Admin → Images (image icon in sidebar)

Every image on the website has a named slot. You replace images by pasting a new URL.

Where to get image URLs
Supabase Storage (recommended — your own photos):
Go to supabase.com → your project → Storage
Create a bucket called site-images (set to Public)
Upload your photo → click it → copy the public URL
Google Drive: Upload photo → right-click → Share → Anyone with link → copy link → convert to direct URL: replace drive.google.com/file/d/FILE_ID/view with drive.google.com/uc?id=FILE_ID
Any public image URL from the web (right-click an image → Copy Image Address)
How to replace an image
Go to Admin → Images
Find the slot you want to change (see the group list below)
Paste the new URL in the text field under the preview thumbnail
Click Save — the preview updates immediately
The public website shows the new image within 1 minute
All 41 image slots organized by group:
Group	Slots	Which page
🏛️ Page Heroes	heroHome, heroHotel, heroRestaurant, heroEvents, heroTravel, heroGallery, heroMenu, heroBlog	Top banner of each respective page
🛏️ Room Types	roomStandard, roomDeluxe, roomSuite	Hotel page — room cards
🏠 Homepage Sections	serviceHotel, serviceRestaurant, serviceEvents, aboutImage, ctaBanner	Homepage cards and about section
🍛 Restaurant & Food	cuisineNorthIndian, cuisineVeg, cuisineSweets, restaurantInterior	Restaurant page
🎉 Events	eventWedding, eventBirthday, eventCorporate, eventSeminar, eventReligious, eventFamily	Events page
✈️ Travel	travelVrindavan, travelMathura, travelAgra	Travel page
🖼️ Gallery	gallery1 through gallery12	Gallery page
Module 4 — Rooms Management
Path: Admin → Rooms

Add a Room
Click Add Room
Fill in: Name (e.g. Room 101), Type (Standard / Deluxe / Suite / Banquet / Conference), Capacity, Price per Night
Set Status: Available / Occupied / Maintenance / Cleaning
Click Save
Update Room Status Quickly
Each room card has 4 small status buttons — click any of them to instantly change:

✅ Available (green)
🔵 Occupied (blue)
🔴 Maintenance (red)
🟡 Cleaning (amber)
No Save button needed — it saves immediately.

Edit or Remove a Room
Click pencil icon to edit all fields
Click trash icon to deactivate (room is hidden from the website; data is not deleted)
Module 5 — Menu Management
Path: Admin → Menu

Add a Menu Item
Click Add Item
Fill in:
Name (required)
Category: Starters / Main Course / Breads / Rice & Biryani / Desserts / Beverages / Chinese / South Indian / Snacks
Price (₹)
Is Veg — check for vegetarian (shows green dot in POS)
GST Rate: 0% / 5% / 12% / 18%
Description (optional)
Sort Order — lower number shows first
Is Active — uncheck to hide from POS and website
Click Save — item appears in POS immediately
Remove an Item
Click the red trash icon → confirm → item is permanently deleted.

Hide an Item Temporarily
Edit the item → uncheck Is Active → Save. The item stays in the database but disappears from POS and public menu page.

Module 6 — Restaurant Tables
Path: Admin → Tables

Add a Table
Click Add Table
Enter table name (e.g. T-1, Window Table, Private Dining) and capacity (seats)
Save
Update Table Status Quickly
Each table card has 4 quick-status buttons:

✅ Available (green)
🔵 Occupied (blue)
🟡 Reserved (amber)
🩷 Cleaning (pink)
Click any to save instantly.

Module 7 — Enquiries
Path: Admin → Enquiries

Enquiries come from the Contact form on the public website.

What you see
Each enquiry shows: name, phone, email, enquiry type (hotel / event / restaurant / travel / general), message, preferred date, guest count, and status.

Gold dot = unread enquiry.

Actions on each enquiry
WhatsApp (always visible) — click to open WhatsApp Web with a pre-filled reply message. Best first response.
Mark Contacted (phone icon) — visible when status is pending. Updates status to contacted
Mark Confirmed (check icon) — updates status to confirmed
Cancel (X icon) — marks as cancelled
Filter enquiries
Use the Type dropdown (by hotel / event / restaurant etc.) and Status dropdown (pending / contacted / confirmed / cancelled) to narrow down the list.

Module 8 — Bookings Calendar
Path: Admin → Calendar

View bookings
The calendar shows the current month. Switch between Rooms and Venues tabs.

Coloured chips on each date = bookings on that day:

Blue = Confirmed
Green = Checked In
Grey = Checked Out
Faded = Cancelled
Click any date to see full booking details below the calendar.

Add a Room Booking
Click + Add Booking
Select type: Room Booking
Choose room from dropdown (only available rooms shown)
Enter guest name, phone (optional), check-in date, check-out date, notes
Save → booking appears on the calendar in blue
Add a Venue / Banquet Booking
Click + Add Booking
Select type: Venue Booking
Venue options: Sharda Banquet Hall / Garden Lawn / Terrace Deck
Choose event type (Wedding / Reception / Birthday / Corporate / Engagement / Anniversary / Other)
Enter client name, phone, event date, notes
Save
Cancel a Booking
Click on the date → find the booking in the list → click Cancel. Status changes to cancelled (shows faded on calendar).

Module 9 — Loyalty Coins
Path: Admin → Loyalty Coins

How the system works
Customers earn coins when they spend at the hotel. Coins can be redeemed for discounts.

The three config values (shown at the top of the page):

Spend per coin — e.g. ₹100 = 1 coin
Coin value — e.g. 1 coin = ₹1 discount
Minimum to redeem — e.g. minimum 50 coins before redeeming
Look up a customer's balance
Enter the customer's phone number in the search box
Click Search
The page shows their name, coin balance, and its rupee discount equivalent
Module 10 — Testimonials
Path: Admin → Testimonials

Customers submit reviews via the public website. Reviews are not visible on the website until you approve them.

Approve a review
Go to the Pending tab
Read the review
Click the green ✓ icon to Approve → it appears on the public homepage testimonials section immediately
Unapprove a review
Go to the Approved tab → click the amber X icon to hide it from the website.

Module 11 — Blog
Path: Admin → Blog

Write a new blog post
Click New Post
Fill in:
Title — the headline
Slug — auto-generated from title (e.g. welcome-to-sharda-palace), editable
Excerpt — short summary (shown in blog card)
Content — full article body
Category — free text (e.g. News, Offers, Travel, Events)
Status: Draft (not visible) or Published (visible on website)
Save
Publish / Unpublish instantly
Click the eye icon on any post to toggle between Published and Draft without opening the editor.

Module 12 — Travel Packages
Path: Admin → Travel

Add a travel package
Click Add Package
Fill in:
Title — package name (e.g. Vrindavan Day Trip)
Price (₹)
Duration — e.g. 1 Day, 3N/4D
Description — multi-line description
Inclusions — type each inclusion on a separate line (e.g. AC Vehicle, Lunch Included, Guide)
Sort Order — lower number shows first
Is Active — uncheck to hide from website
Save — package appears on the Travel page immediately
Hide a package
Edit → uncheck Is Active → Save. Package disappears from website but data is preserved.

Module 13 — Staff Users
Path: Admin → Staff Users

Add a staff account
Click Add User
Fill in: Username, Display Name (optional), Password, Role
Roles available: Admin / Manager / Staff / Waiter
Save
Deactivate a staff member
Click Deactivate on their row — they can no longer log in. Click Activate to restore access.

Note: The superadmin account cannot be deactivated from this page.

Module 14 — Site Configuration
Path: Admin → Site Config

This is where you control all text and links across the entire website.

All configurable settings:
🏨 General

Field	What it changes
hotel_name	Hotel name shown in header, footer, bill
tagline	Subtitle shown on homepage hero
description	Description in footer and About section
📞 Contact Information

Field	What it changes
phone	Phone number shown across all pages
email	Email address in footer and contact page
whatsapp	WhatsApp number for quick-contact buttons (numbers only, e.g. 917303584266)
address	Full address in footer and contact page
🌐 Social Media

Field	What it changes
facebook_url	Facebook link in footer
instagram_url	Instagram link in footer
youtube_url	YouTube link in footer
📍 Location & Maps

Field	What it changes
google_maps_embed	The embedded map on homepage and contact page
google_maps_link	"Get Directions" button link
🕐 Timings

Field	What it changes
restaurant_hours	Shown on restaurant page and footer
reception_hours	Shown on contact page
checkin_time	Shown on hotel page
checkout_time	Shown on hotel page
How to save a change
Edit any field → the field border turns gold → click Save next to that field. Changes appear on the public website within 1 minute.

Quick Reference: What Goes Where
Task	Go To
Take a food order + print bill	Admin → POS
Change homepage images	Admin → Images → Homepage Sections
Change room photos	Admin → Images → Room Types
Change gallery photos	Admin → Images → Gallery Photos
Change Google Maps	Admin → Site Config → Maps
Change phone / WhatsApp	Admin → Site Config → Contact
Change social media links	Admin → Site Config → Social
Add / remove menu items	Admin → Menu
Mark table as occupied	Admin → Tables
Mark room as occupied	Admin → Rooms
Add a hotel booking	Admin → Calendar → + Add Booking
See incoming enquiries	Admin → Enquiries
Approve a customer review	Admin → Testimonials
Write a blog post	Admin → Blog
Add a travel package	Admin → Travel
Check customer loyalty coins	Admin → Loyalty Coins
Add staff login	Admin → Staff Users
Claude Sonnet 4.6 • 1x