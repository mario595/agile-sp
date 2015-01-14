# Agile Story Pointing
This project is based in the **NodeJS Express Seed** project you can find here: https://github.com/btford/angular-express-seed. It is a working example of some technologies such as NodeJS and AngularJS.

##Overview
This is intended to be a fairly simple web application to manage interactive Agile Story Pointing sessions (http://www.mountaingoatsoftware.com/agile/planning-poker). The app has one board, similar to a chat room, that users can join by entering on the app url. On this board, we've got a left column with a list of stories created by the Scrum Master. At the left we can see a list of all the users currently connected to the board. The first user to connect will have the role of Scrum Master and his name will appear bold.

Once the Scrum Master has created a story, it will automatically appear on the other users' board. Then, the Scrum Master can open the story, so all the users can cast their votes. When a story is opened, it will automatically appear on all the users a list of possible values, so they can choose their vote.

After that, the Scrum Master can close the story. From that point, users won't be able to change their vote. All the users' votes will be collected and shown to all the users. Then, the Scrum Master can open the story again, and repeat the process.

##Installation
For installation, just clone the repository and run `npm install` to fetch the dependencies. Then just run `node app.js`.

##Future Improvements
There are some improvements in progress at the moment, here is some of them:
- **Multiple boards**. At the moment there is no possibility to create multiple boards, so all the users using the application are in the same session. This will be improved by allowing the creation of new boards the users can join using a board identifier.
- **Messaging and Logging**. At the moment, is not possible for the users to send messages to each others. This will be implemented. Also, the system notify the users only when somebody joins the board, so more actions will be notified to the users.
- **Improved statistics**. Now, the only information about the votes is a list of all the different votes. In the future, there will be more useful data representations such as graphs. 
