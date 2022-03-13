# Quichta420Project

Documentation: localhost:PORT/doc

Regarding the input validation, we chose to implement json schemas to check all of our inputs, responses and to generate a project documentation.

Regarding the authorisation, our users will or will not have the rights to modify, add or delete data depending on:
- their JWT token (is the user registered? If not they will only be able to access the login et sign in routes);
- their status (an "invitor" may send invitations to a party unlike an "invited" or a "participant");
- wether they are invited to a party or not (someone invited to a party will get the access to the party information and can add an item to bring but won't be able to modify another user's data);
- depending on wether your're invited or not to a part you will get access to party data and what people will bring.

Regarding the secret management, we wrote a dotenv file containing the most sensitive data (database connection data and JWT-key) and added a dotenv-example for you to see what we stored in it without the values.



