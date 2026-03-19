CREATE TABLE menu (
    id SERIAL PRIMARY KEY,
    name TEXT,
    price NUMERIC
);

INSERT INTO menu (name, price) VALUES
('Burger', 120),
('Pizza', 250),
('Pasta', 180);
