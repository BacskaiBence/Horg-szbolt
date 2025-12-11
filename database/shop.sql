CREATE DATABASE fishing_shop
DEFAULT CHARACTER SET utf8
COLLATE utf8_hungarian_ci;

USE fishing_shop;

CREATE TABLE users(
    id int AUTO_INCREMENT PRIMARY KEY,
    username varchar(255),
    pasword varchar(255),
    email varchar(255),
    phone_number varchar(255),
    address varchar(255),
    entitlement tinyint
);

CREATE TABLE products(
    id int AUTO_INCREMENT PRIMARY KEY,
    name varchar(255),
    description varchar(255),
    price int,
    quantity int,

);

CREATE TABLE orders(
    id int AUTO_INCREMENT PRIMARY KEY,
    user_id int,
    product_id int,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);