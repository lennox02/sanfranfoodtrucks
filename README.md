# San Fran Food Trucks

This is a React Native Project developed in snack.expo.dev

To try out the project please visit https://snack.expo.dev/@jameswebbdev/sanfranfoodtrucks?platform=ios

## Usage

The project is designed to allow a user to see a map of SF, centered on Moscone center.  The user can drag the map, to move their position, which generates a new group of trucks within a .005 lat/longitudal raidus of the new position.

The project is designed to be offline friendly, so if the app has been loaded once but is currenlty offline, it will retrieve a stored version of the Food Truck csv data.  It also will only grab a new version of the cvs once a day to avoid needless queries.

The one feature that could not be implemented in a  2-3 hour timeframe was retrieving a users current location.  That requires configuration of device permission settings, which is unavailable on snack.expo.dev, so as a compromise the app simply starts centered on Moscone Center.

If you have questions, please feel free to DM me on GitHub or LinkedIn
