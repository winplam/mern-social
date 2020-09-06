'GET:/ - Hello World!'
curl http://localhost:3000/

'POST:/api/users - Creating new users'
'POST:/api/users - Attempting to create a duplicate user'
curl -s -X POST -H "Content-Type:application/json" http://localhost:3000/api/users -d '{"name":"Bobby 1","email":"bob@mymail.com","password":"mypassword"}' | jq
curl -X POST -H "Content-Type:application/json" http://localhost:3000/api/users -d '{"name":"Sally 1","email":"sally@mymail.com","password":"mypassword"}'
curl -X POST -H "Content-Type:application/json" http://localhost:3000/api/users -d '{"name":"Shido 1","email":"shido@mymail.com","password":"mypassword"}'

'POST:/api/users - Attempting to create with password too short'
curl -s -X POST -H "Content-Type:application/json" http://localhost:3000/api/users -d '{"name":"Mr. Password Too Short","email":"password@too-short.com","password":"short"}' | jq

'POST:/api/users - Attempting to create without password'
curl -s -X POST -H "Content-Type:application/json" http://localhost:3000/api/users -d '{"name":"Mr. Missing Password","email":"missing@password.com","password":""}' | jq

'GET:/api/users - Fetching the user list'
curl -s http://localhost:3000/api/users | jq

'GET:/api/users/:id - Trying to fetch a non-existing single user'
curl -i http://localhost:3000/api/users/zzz

ID=5f4e037544a1cb75e4c9280f && echo $ID
'GET:/api/users/:id - Trying to fetch an existing single user'
curl -s http://localhost:3000/api/users/${ID} | jq

'PUT:/api/users/:id - Attempting to update user without signing in first'
curl -s -X PUT -H "Content-Type:application/json" http://localhost:3000/api/users/${ID} -d '{"name":"Bobby 2","email":"bob@mymail.com","password":"mypassword"}' | jq

'POST:/api/signin - Attempting to signing in - User not found'
curl -X POST -H "Content-Type:application/json" http://localhost:3000/auth/signin -d '{"email":"user_not_found@mymail.com","password":"user_not_found"}'

'POST:/api/signin - Attempting to signing in - Wrong password'
curl -X POST -H "Content-Type:application/json" http://localhost:3000/auth/signin -d '{"email":"bob@mymail.com","password":"wrong_password"}'

'POST:/api/signin - Signing in successfully'
curl -X POST -H "Content-Type:application/json" http://localhost:3000/auth/signin -d '{"email":"bob@mymail.com","password":"mypassword"}'
curl -X POST -H "Content-Type:application/json" http://localhost:3000/auth/signin -d '{"email":"sally@mymail.com","password":"mypassword"}'
TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjRlMDM3NTQ0YTFjYjc1ZTRjOTI4MGYiLCJpYXQiOjE1OTk0MTQ4MjYsImV4cCI6MTU5OTQxNDg4Nn0.eAj4zUsdMY0eLBV1FuAuoxI0cuChKYMnvHbQzlQV4ZQ
echo $TOKEN

'GET:/api/users/:id - Fetching a single user successfully', () => {
curl http://localhost:3000/api/users/${ID} -H "Content-Type:application/json" -H "Authorization:Bearer ${TOKEN}"
ID2=5f4e037c44a1cb75e4c92810 && echo $ID2
curl http://localhost:3000/api/users/${ID2} -H "Content-Type:application/json" -H "Authorization:Bearer ${TOKEN}"

'PUT:/api/users/:id - Attempt to update non-existing user'
curl -X PUT -H "Content-Type:application/json" http://localhost:3000/api/users/zzz -d '{"name":"No User","email":"non_user@mymail.com","password":"mypassword"}' -H "Authorization:Bearer ${TOKEN}"

'PUT:/api/users/:id - Attempt to update somebody else`s user profile'
curl -X PUT -H "Content-Type:application/json" http://localhost:3000/api/users/${ID2} -d '{"name":"Somebody Else","email":"somebody_else@mymail.com","password":"mypassword"}' -H "Authorization:Bearer ${TOKEN}"

'PUT:/api/users/:id - Successfully updating your own user profile'
curl -X PUT -H "Content-Type:application/json" http://localhost:3000/api/users/${ID} -d '{"name":"Bobby Updated","email":"bob@mymail.com","password":"mypassword"}' -H "Authorization:Bearer ${TOKEN}"

'DELETE:/api/users/:id - Attempting to delete user without token'
curl -X DELETE http://localhost:3000/api/users/${ID}

'DELETE:/api/users/:id - Attempting to deleting a non-existing user'
curl -X DELETE http://localhost:3000/api/users/zzz -H "Authorization:Bearer ${TOKEN}"

'DELETE:/api/users/:id - Attempting to delete somebody else`s account'
curl -X DELETE http://localhost:3000/api/users/${ID2} -H "Authorization:Bearer ${TOKEN}"

'DELETE:/api/users/:id - Successfully deleting own profile'
curl -X DELETE http://localhost:3000/api/users/${ID} -H "Authorization:Bearer ${TOKEN}"

'GET:/auth/signout - Signing out'
curl http://localhost:3000/auth/signout

# Sample JWT token expired error
{"error":"UnauthorizedError: jwt expired"}