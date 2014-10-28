Good Impressions is a web app that gives you directions provided you want to stop to get coffee and/or donuts on the way. It automatically finds the 5 closest coffee and donut shops to your destination and lets you pick which (if any) you'd like to stop at. Why the closest 5 to your destination? Because surely you want your coffee and donuts to arrrive hot and fresh! Once you've made your selection(s), it generates directions from your start location to the shop(s) you selected, and finally to your destination.

Libraries:
Google Directions
Google Geocode
Google Places

Places for improvement:
- Add in transit functionality. Currently, the Google Directions service doesn't allow waypoints for transit directions. One way to get around this is to generate directions from the start to the first shop, then generate more directions from the first shop to the second (if a second one was selected), and then more directions for the second shop to the destination.
- Make calls to the Google Place Details API to give the user more information about a place, like phone number, images, etc. More information means the user can make a more informed decision on which shop he/she wants to go to.-
- Make the app prettier. I'm no CSS master!

