#!/bin/bash

# ask the user for a username and password combination, store the values in variables and call the backend.seed python script with arguments
echo "Enter a username: "
read username

# check if the username is empty
while [ -z "$username" ]; do
    echo "Username cannot be empty. Please enter a username: "
    read username
done

echo "Enter a password: "
read password

# check if the password is empty
while [ -z "$password" ]; do
    echo "Password cannot be empty. Please enter a password: "
    read password
done

echo "Enter user full name: "
read full_name

# check if the full name is empty
while [ -z "$full_name" ]; do
    echo "Full name cannot be empty. Please enter a full name: "
    read full_name
done

# Pass arguments in quotes to handle spaces correctly
python -m backend.seed "$username" "$password" "$full_name"
