# e-com-learn

### MongoDb

-   To run MongoDB

```bash
brew services start mongodb-community@7.0
```

-   To stop MongoDB

```bash
brew services stop mongodb-community@7.0
```

-   To verify MongoDB is running

```bash
brew services list
```

## Refresh Tokens Used

-   Suppose user login already => AT and RT (access token and refresh token) is stored in db, when AT expire, RT need to refresh to create both new AT and RT.
-   Then, the old RT need to store in DB as refreshTokensUsed
-   If someone use the old token illegally, server will remove this token and force user to renew AT and RT (re-login )
