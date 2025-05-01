import { db } from "./index";
import { 
  locations, 
  crimeReports, 
  policeOfficers, 
  policeReports, 
  socialMedia, 
  weatherData 
} from "@shared/schema";
import { sql } from "drizzle-orm";

async function seed() {
  try {
    console.log("Starting data seeding...");
    
    // Check if data already exists to avoid duplicates
    const existingLocations = await db.select().from(locations).limit(1);
    
    if (existingLocations.length > 0) {
      console.log("Data already exists in the database, skipping seeding...");
      return;
    }

    // Locations
    console.log("Inserting locations...");
    await db.execute(sql`
      INSERT INTO locations (location_id, address, geolocation, type_of_address)
      VALUES 
        ('L01', '123 Main St', '40.7128,-74.0060', 'Residential'),
        ('L02', '456 Elm Rd', '34.0522,-118.2437', 'Commercial'),
        ('L03', '789 Oak Ave', '41.8781,-87.6298', 'Public'),
        ('L04', '321 Pine Blvd', '39.9526,-75.1652', 'Industrial'),
        ('L05', '901 Maple St', '29.7604,-95.3698', 'Residential'),
        ('L06', '234 Cedar Rd', '37.7749,-122.4194', 'Commercial'),
        ('L07', '567 Spruce Ave', '42.3584,-71.0596', 'Public'),
        ('L08', '890 Walnut St', '35.7796,-78.6382', 'Residential'),
        ('L09', '345 Cherry Rd', '30.2672,-97.7431', 'Commercial'),
        ('L10', '678 Cypress Ave', '43.6532,-79.3832', 'Public')
    `);
    
    // Crime Reports
    console.log("Inserting crime reports...");
    await db.execute(sql`
      INSERT INTO crime_reports (crime_id, date, description, type_of_crime, arrest_status, location_id)
      VALUES 
        ('C01', '2023-01-05', 'Wallet stolen from parked car', 'Theft', 'No Arrest', 'L01'),
        ('C02', '2023-01-12', 'Bar fight resulting in injury', 'Assault', 'Arrested', 'L02'),
        ('C03', '2023-02-18', 'Store window smashed', 'Vandalism', 'Pending', 'L03'),
        ('C04', '2023-03-15', 'Cyber hacking incident', 'Cyber Crime', 'Pending', 'L04'),
        ('C05', '2023-04-10', 'Burglary at residential home', 'Theft', 'No Arrest', 'L05'),
        ('C06', '2023-05-05', 'Physical altercation in public', 'Assault', 'Arrested', 'L06'),
        ('C07', '2023-06-01', 'Graffiti on public property', 'Vandalism', 'Pending', 'L07'),
        ('C08', '2023-07-04', 'Theft of personal belongings', 'Theft', 'No Arrest', 'L08'),
        ('C09', '2023-08-15', 'Credit card fraud reported', 'Fraud', 'Pending', 'L09'),
        ('C10', '2023-09-10', 'Assault with a deadly weapon', 'Assault', 'Arrested', 'L10')
    `);
    
    // Police Officers
    console.log("Inserting police officers...");
    await db.execute(sql`
      INSERT INTO police_officers (officer_id, name, position, assigned_area)
      VALUES 
        ('PO_01', 'James Carter', 'Sergeant', 'Downtown Precinct'),
        ('PO_02', 'Sarah Connor', 'Lieutenant', 'Financial District'),
        ('PO_03', 'Michael Rodriguez', 'Officer', 'Suburban Division'),
        ('PO_04', 'Emma Wilson', 'Captain', 'Special Investigations'),
        ('PO_05', 'John Smith', 'Officer', 'City Center'),
        ('PO_06', 'Jane Doe', 'Sergeant', 'Downtown Precinct'),
        ('PO_07', 'Robert Johnson', 'Lieutenant', 'Suburban Division'),
        ('PO_08', 'Olivia Brown', 'Officer', 'Financial District'),
        ('PO_09', 'William Taylor', 'Captain', 'City Center'),
        ('PO_10', 'Ava Lee', 'Sergeant', 'Special Investigations')
    `);
    
    // Police Reports
    console.log("Inserting police reports...");
    await db.execute(sql`
      INSERT INTO police_reports (report_id, date, outcome, crime_id, officer_id)
      VALUES 
        ('R01', '2023-01-07', 'Suspect identified', 'C01', 'PO_05'),
        ('R02', '2023-01-13', 'Case closed with conviction', 'C02', 'PO_02'),
        ('R03', '2023-02-20', 'Investigation ongoing', 'C03', 'PO_08'),
        ('R04', '2023-03-25', 'Charges dropped', 'C04', 'PO_01'),
        ('R05', '2023-04-10', 'Case closed', 'C05', 'PO_04'),
        ('R06', '2023-05-05', 'Investigation ongoing', 'C06', 'PO_06'),
        ('R07', '2023-06-01', 'Suspect arrested', 'C07', 'PO_03'),
        ('R08', '2023-07-04', 'Case closed', 'C08', 'PO_09'),
        ('R09', '2023-08-15', 'Investigation ongoing', 'C09', 'PO_02'),
        ('R10', '2023-09-10', 'Charges filed', 'C10', 'PO_10')
    `);
    
    // Social Media
    console.log("Inserting social media posts...");
    await db.execute(sql`
      INSERT INTO social_media (post_id, date, content, sentiment, location)
      VALUES 
        ('P01', '2023-01-06', 'Concerns about safety in the area.', 'Negative', 'New York'),
        ('P02', '2023-01-13', 'Appreciation for local police efforts.', 'Positive', 'Los Angeles'),
        ('P03', '2023-02-19', 'Report of suspicious activity.', 'Neutral', 'Chicago'),
        ('P04', '2023-03-25', 'Complaints about crime rates.', 'Negative', 'Houston'),
        ('P05', '2023-04-10', 'Praise for community policing.', 'Positive', 'Phoenix'),
        ('P06', '2023-05-05', 'Discussion about crime prevention.', 'Neutral', 'New York'),
        ('P07', '2023-06-01', 'Concerns about police response times.', 'Negative', 'Los Angeles'),
        ('P08', '2023-07-04', 'Appreciation for police service.', 'Positive', 'Chicago'),
        ('P09', '2023-08-15', 'Reports of increased crime.', 'Negative', 'Houston'),
        ('P10', '2023-09-10', 'Community safety tips.', 'Neutral', 'Phoenix')
    `);
    
    // Weather Data
    console.log("Inserting weather data...");
    await db.execute(sql`
      INSERT INTO weather_data (weather_id, date, precipitation, temperature, wind_speed)
      VALUES 
        ('W01', '2023-01-05', '0.2 in', '34°F', '12 mph'),
        ('W02', '2023-01-12', '0.0 in', '28°F', '8 mph'),
        ('W03', '2023-02-18', '0.5 in', '41°F', '15 mph'),
        ('W04', '2023-03-15', '0.1 in', '45°F', '10 mph'),
        ('W05', '2023-04-10', '0.3 in', '52°F', '18 mph'),
        ('W06', '2023-05-05', '0.0 in', '60°F', '5 mph'),
        ('W07', '2023-06-01', '0.4 in', '65°F', '12 mph'),
        ('W08', '2023-07-04', '0.2 in', '75°F', '8 mph'),
        ('W09', '2023-08-15', '0.6 in', '80°F', '15 mph'),
        ('W10', '2023-09-10', '0.0 in', '70°F', '10 mph')
    `);

    console.log("Data seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
