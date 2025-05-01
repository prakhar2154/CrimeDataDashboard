import { pgTable, text, serial, timestamp, date, varchar, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Location table
export const locations = pgTable("locations", {
  id: varchar("location_id").primaryKey(),
  address: text("address").notNull(),
  geolocation: text("geolocation").notNull(),
  typeOfAddress: text("type_of_address").notNull(),
});

// Crime Report table
export const crimeReports = pgTable("crime_reports", {
  id: varchar("crime_id").primaryKey(),
  date: date("date").notNull(),
  description: text("description").notNull(),
  typeOfCrime: text("type_of_crime").notNull(),
  arrestStatus: text("arrest_status").notNull(),
  locationId: varchar("location_id").references(() => locations.id).notNull(),
});

// Police Officer table
export const policeOfficers = pgTable("police_officers", {
  id: varchar("officer_id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  assignedArea: text("assigned_area").notNull(),
});

// Police Report table
export const policeReports = pgTable("police_reports", {
  id: varchar("report_id").primaryKey(),
  date: date("date").notNull(),
  outcome: text("outcome").notNull(),
  crimeId: varchar("crime_id").references(() => crimeReports.id).notNull(),
  officerId: varchar("officer_id").references(() => policeOfficers.id).notNull(),
});

// Social Media table
export const socialMedia = pgTable("social_media", {
  id: varchar("post_id").primaryKey(),
  date: date("date").notNull(),
  content: text("content").notNull(),
  sentiment: text("sentiment").notNull(),
  location: text("location").notNull(),
});

// Weather Data table
export const weatherData = pgTable("weather_data", {
  id: varchar("weather_id").primaryKey(),
  date: date("date").notNull(),
  precipitation: text("precipitation").notNull(),
  temperature: text("temperature").notNull(),
  windSpeed: text("wind_speed").notNull(),
});

// Define relations
export const locationsRelations = relations(locations, ({ many }) => ({
  crimeReports: many(crimeReports),
}));

export const crimeReportsRelations = relations(crimeReports, ({ one, many }) => ({
  location: one(locations, {
    fields: [crimeReports.locationId],
    references: [locations.id],
  }),
  policeReports: many(policeReports),
}));

export const policeOfficersRelations = relations(policeOfficers, ({ many }) => ({
  policeReports: many(policeReports),
}));

export const policeReportsRelations = relations(policeReports, ({ one }) => ({
  crimeReport: one(crimeReports, {
    fields: [policeReports.crimeId],
    references: [crimeReports.id],
  }),
  officer: one(policeOfficers, {
    fields: [policeReports.officerId],
    references: [policeOfficers.id],
  }),
}));

// Define schemas for validation and type inference
export const locationInsertSchema = createInsertSchema(locations);
export type LocationInsert = z.infer<typeof locationInsertSchema>;
export type Location = typeof locations.$inferSelect;

export const crimeReportInsertSchema = createInsertSchema(crimeReports);
export type CrimeReportInsert = z.infer<typeof crimeReportInsertSchema>;
export type CrimeReport = typeof crimeReports.$inferSelect;

export const policeOfficerInsertSchema = createInsertSchema(policeOfficers);
export type PoliceOfficerInsert = z.infer<typeof policeOfficerInsertSchema>;
export type PoliceOfficer = typeof policeOfficers.$inferSelect;

export const policeReportInsertSchema = createInsertSchema(policeReports);
export type PoliceReportInsert = z.infer<typeof policeReportInsertSchema>;
export type PoliceReport = typeof policeReports.$inferSelect;

export const socialMediaInsertSchema = createInsertSchema(socialMedia);
export type SocialMediaInsert = z.infer<typeof socialMediaInsertSchema>;
export type SocialMediaPost = typeof socialMedia.$inferSelect;

export const weatherDataInsertSchema = createInsertSchema(weatherData);
export type WeatherDataInsert = z.infer<typeof weatherDataInsertSchema>;
export type WeatherDataRecord = typeof weatherData.$inferSelect;

// Keep the original users table for authentication (existing in the template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
