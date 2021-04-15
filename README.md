# Mobile application for admission to master's degree

It is a mobile application for admission to master's degree. In app implemented a functionallity of learning foreign(english) language through vocabulary learning and trainings(3 different types) with regular repetitions.
In  addition, it has authorization(sign up and log in) and multilingual interface.
## API documentation
Create user

Endpoint: /register_user

```
Headers: 
Content-Type: application/json
Description: creates a new User 
Example body: 
{
   "userName": "username19",
   "password": "Aa123412",
   "currentLanguage": 350
}
```

Create session (login a user) 

Endpoint: /api/ezp/v2/user/sessions

```
Headers: 
Accept: application/vnd.ez.api.Session+json;
Content-Type: application/vnd.ez.api.SessionInput+json;
Cookie: string;
X-CSRF-Token: string;
Description: Performs a login for the user or checks if session exists and returns the session and session cookie. The client will need to remember both session name/ID and CSRF token as this is for security reasons not exposed via GET.
```

Example body: 

```
{
  "SessionInput": {
    "login": "admin",
    "password": "secret"
  }
}
```

Example response:

```
{
  "Session": {
    "name": "eZSSID",
    "identifier": "go327ij2cirpo59pb6rrv2a4el2",
    "csrfToken": "23lkneri34ijajedfw39orj3j93",
    "User": {
      "_href": "/user/users/14",
      "_media-type": "application/vnd.ez.api.User+json"
    }
  }
```

Delete session (logout a user)

Endpoint: /api/ezp/v2/user/sessions/{sessionId}

```
Description: The user session is removed i.e. the user is logged out.
Headers:
Cookie: string
X-CSRF-Token: string
```

Displaying content:

Endpoint: /base_languages 
Description: lists all base languages.

Example response:

```
[
   {
       "id": 349,
       "order": 1,
       "name": "English",
       "image": "http://localhost:42080/var/site/storage/images/_aliases/large/7/8/9/2/2987-1-eng-GB/united-kingdom.png",
       "url": "/languages/349"
   }
]
```

Endpoint: /languages/{id of base language}
Description: Lists languages of a given base language.
Example response:

```
[
   {
       "id": 352,
       "order": 1,
       "name": "Ukrainian",
       "image": "http://localhost:42080/var/site/storage/images/_aliases/large/8/9/9/2/2998-1-eng-GB/ukraine.png",
       "languageId": 352
   }
]
```

Endpoint: /dictionaries

```
Headers:
Cookie: string
Description: Lists dictionaries and progress of a language selected by user and user’s day streak.
Example response:
{
   "progress_1": 0,
   "progress_2": 0,
   "progress_3": 0,
   "streak": 1,
   "objects": [
       {
           "id": 484,
           "order": 1,
           "name": "Simple words",
           "description": "Some simple words like apple, etc.",
           "url": "/phrases/484",
           "progress": 0
       }
   ]
}
```

Endpoint: /phrases/{id of dictionary}

```
Headers:
Cookie: string
Description: Lists phrases and progress of a given dictionary and user’s day streak.
{
   "progress_1": 0,
   "progress_2": 0,
   "progress_3": 0,
   "streak": 1,
   "objects": [
       {
           "id": 485,
           "order": 1,
           "word": "Dom",
           "translation": "House",
           "audio": "localhost:42080/content/download/3609?version=1/audio/11.wav?inLanguage=eng-GB",
           "progress": 0
       }
   ]
}
```

Learning process

Endpoint: /dictionaries/training 

```
Headers:
Cookie: string
Description: Lists up to five words for learning which belong to dictionaries of a language selected by user
Example response:
[
   {
       "id": 485,
       "word": "Dom",
       "translation": "House",
       "fakeTranslations": [
           {
               "id": 63,
               "name": "Jędzyk"
           },
           {
               "id": 60,
               "name": "Dom"
           },
           {
               "id": 485,
               "name": "House"
           },
           {
               "id": 326,
               "name": "Goodbye!"
           }
       ],
       "audio": "localhost:42080/content/download/3609?version=1/audio/11.wav?inLanguage=eng-GB",
       "swipeFake": "Dom"
   }      
]
```

Endpoint: /dictionaries/review_{exercise identifier}

```
Headers: 
Cookie: string
Description: Lists up to five words for specific exercise type which belong to dictionaries of a language selected by user
Example response:
[
   {
       "id": 485,
       "word": "Dom",
       "translation": "House",
       "fakeTranslations": [
           {
               "id": 63,
               "name": "Jędzyk"
           },
           {
               "id": 60,
               "name": "Dom"
           },
           {
               "id": 485,
               "name": "House"
           },
           {
               "id": 326,
               "name": "Goodbye!"
           }
       ],
       "audio": "localhost:42080/content/download/3609?version=1/audio/11.wav?inLanguage=eng-GB",
       "swipeFake": "Dom"
   }      
]
```

Endpoint: /submit

```
Headers: 
Cookie: string
Description: Submits progress of learning or reviews. Status shows how successfully the user has interacted with a word of a given id. Position of the symbol in status means type of exercise - 1, 2 or 3. Available statuses for each exercise are: 1 - successful interaction, 0 - unsuccessful interaction, n - the interaction didn’t occur. 
Example body:
[
   {
       "id": 380,
       "status": "111"
   },
   {
       "id": 381,
       "status": "1nn"
   }
]
```

## Functional and logical structure of the project
![asd](https://user-images.githubusercontent.com/43434679/114840338-62747800-9ddf-11eb-913e-d9ecab100bf5.png)
