USE Batloung_db;

INSERT INTO box_sizes (size_name, description) VALUES
('Small','Small quantity for limited capital or lower daily demand'),
('Medium','Medium quantity for moderate customer demand'),
('Large','Larger quantity for higher volume purchases');

INSERT INTO fruits (fruit_name) VALUES
('Apples'),('Bananas'),('Oranges'),('Mangoes'),('Grapes');

INSERT INTO products (fruit_id, box_size_id, unit_price, available_stock) VALUES
(1,1,50.00,100),(1,2,90.00,80),(1,3,130.00,50),
(2,1,40.00,120),(2,2,75.00,90),(2,3,110.00,60),
(3,1,45.00,90),(3,2,85.00,70),(3,3,120.00,40),
(4,1,60.00,80),(4,2,110.00,60),(4,3,160.00,30),
(5,1,70.00,70),(5,2,130.00,50),(5,3,180.00,20);

INSERT INTO suppliers (supplier_name, province, contact_person, telephone, email, physical_address) VALUES
('Western Cape Fruits','Western Cape','John Doe','0211234567','john@wcfruits.co.za','Cape Town'),
('Limpopo Fresh','Limpopo','Jane Smith','0159876543','jane@limpopofresh.co.za','Polokwane'),
('KZN Produce','KwaZulu-Natal','Sipho Dlamini','0315551234','sipho@kznproduce.co.za','Durban'),
('Free State Farms','Free State','Anna Mokoena','0512223333','anna@fsfarms.co.za','Bloemfontein'),
('Mpumalanga Growers','Mpumalanga','Peter Nkosi','0136667890','peter@mpgrowers.co.za','Nelspruit'),
('Eastern Cape Citrus','Eastern Cape','Lindiwe Zulu','0417771234','lindiwe@eccitrus.co.za','Port Elizabeth'),
('Northern Cape Vineyards','Northern Cape','Koos van Wyk','0538885678','koos@ncvine.co.za','Kimberley'),
('North West Harvest','North West','Thandi Mahlangu','0189992345','thandi@nwharvest.co.za','Rustenburg'),
('Gauteng Market Link','Gauteng','David Pillay','0115556789','david@gml.co.za','Johannesburg');

INSERT INTO street_vendors (vendor_name, business_name, telephone, location_maseru, registration_date, status) VALUES
('Thabo Mokoena','Thabo Fruits','58001122','Maseru West','2024-01-15','Active'),
('Lineo Khoase','Lineo Produce','58003344','Maseru East','2024-02-20','Active'),
('Mpho Ramoholi','Mpho Fresh','58005566','Maseru Central','2024-03-10','Active');