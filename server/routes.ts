import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { 
  locations, 
  crimeReports, 
  policeOfficers, 
  policeReports, 
  socialMedia, 
  weatherData 
} from "@shared/schema";
import { eq, and, like, ilike, gte, lte, desc, asc, count, sql, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // --- API Routes ---
  
  // Dashboard statistics
  app.get('/api/stats', async (req, res) => {
    try {
      // Total crimes count
      const totalCrimesResult = await db.select({ count: count() }).from(crimeReports);
      const totalCrimes = totalCrimesResult[0]?.count || 0;
      
      // Calculate arrest rate
      const arrestedResult = await db
        .select({ count: count() })
        .from(crimeReports)
        .where(eq(crimeReports.arrestStatus, 'Arrested'));
      const arrestRate = Math.round((arrestedResult[0]?.count || 0) / totalCrimes * 100);
      
      // Get most common crime type
      const crimeTypesCount = await db
        .select({
          type: crimeReports.typeOfCrime,
          count: count(),
        })
        .from(crimeReports)
        .groupBy(crimeReports.typeOfCrime)
        .orderBy(desc(count()))
        .limit(1);
      
      const mostCommonCrime = crimeTypesCount[0] || { type: 'None', count: 0 };
      const mostCommonCrimePercentage = Math.round((mostCommonCrime.count / totalCrimes) * 100);
      
      // Get recent crimes (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentCrimesResult = await db
        .select({ count: count() })
        .from(crimeReports)
        .where(gte(crimeReports.date, thirtyDaysAgo.toISOString()));
      
      const stats = {
        totalCrimes,
        arrestRate,
        mostCommonCrime: {
          type: mostCommonCrime.type,
          count: mostCommonCrime.count,
          percentage: mostCommonCrimePercentage
        },
        recentCrimes: recentCrimesResult[0]?.count || 0
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });
  
  // Crime types with count
  app.get('/api/crime-types', async (req, res) => {
    try {
      const result = await db
        .select({
          type: crimeReports.typeOfCrime,
          count: count(),
        })
        .from(crimeReports)
        .groupBy(crimeReports.typeOfCrime)
        .orderBy(desc(count()));
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching crime types:', error);
      res.status(500).json({ error: 'Failed to fetch crime types' });
    }
  });
  
  // Arrest status distribution
  app.get('/api/arrest-status', async (req, res) => {
    try {
      const totalCrimesResult = await db.select({ count: count() }).from(crimeReports);
      const totalCrimes = totalCrimesResult[0]?.count || 0;
      
      const statusResults = await db
        .select({
          status: crimeReports.arrestStatus,
          count: count(),
        })
        .from(crimeReports)
        .groupBy(crimeReports.arrestStatus);
      
      const statusData = statusResults.map(item => ({
        status: item.status,
        count: item.count,
        percentage: Math.round((item.count / totalCrimes) * 100)
      }));
      
      res.json(statusData);
    } catch (error) {
      console.error('Error fetching arrest status:', error);
      res.status(500).json({ error: 'Failed to fetch arrest status data' });
    }
  });
  
  // Crime locations for map
  app.get('/api/crime-locations', async (req, res) => {
    try {
      const result = await db
        .select({
          id: locations.id,
          address: locations.address,
          geolocation: locations.geolocation,
          typeOfAddress: locations.typeOfAddress,
          crimeId: crimeReports.id,
          crimeType: crimeReports.typeOfCrime,
          crimeDescription: crimeReports.description,
        })
        .from(locations)
        .leftJoin(crimeReports, eq(locations.id, crimeReports.locationId))
        .limit(100); // Limiting for better performance
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching crime locations:', error);
      res.status(500).json({ error: 'Failed to fetch crime locations' });
    }
  });
  
  // Crime trends over time
  app.get('/api/crime-trends', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT
          TO_CHAR(date, 'Mon YYYY') as month,
          EXTRACT(YEAR FROM date) as year,
          EXTRACT(MONTH FROM date) as month_num,
          COUNT(*) as count
        FROM
          crime_reports
        GROUP BY
          TO_CHAR(date, 'Mon YYYY'),
          EXTRACT(YEAR FROM date),
          EXTRACT(MONTH FROM date)
        ORDER BY
          year, month_num
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching crime trends:', error);
      res.status(500).json({ error: 'Failed to fetch crime trends' });
    }
  });
  
  // Recent crimes for dashboard
  app.get('/api/recent-crimes', async (req, res) => {
    try {
      const result = await db
        .select({
          id: crimeReports.id,
          date: crimeReports.date,
          description: crimeReports.description,
          type: crimeReports.typeOfCrime,
          status: crimeReports.arrestStatus,
          address: locations.address,
        })
        .from(crimeReports)
        .leftJoin(locations, eq(crimeReports.locationId, locations.id))
        .orderBy(desc(crimeReports.date))
        .limit(10);
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching recent crimes:', error);
      res.status(500).json({ error: 'Failed to fetch recent crimes' });
    }
  });
  
  // All crimes with filtering
  app.get('/api/crimes', async (req, res) => {
    try {
      const { type, status, dateRange, search } = req.query;
      
      let query = db
        .select({
          id: crimeReports.id,
          date: crimeReports.date,
          description: crimeReports.description,
          type: crimeReports.typeOfCrime,
          status: crimeReports.arrestStatus,
          address: locations.address,
          locationId: locations.id,
          officerName: policeOfficers.name,
        })
        .from(crimeReports)
        .leftJoin(locations, eq(crimeReports.locationId, locations.id))
        .leftJoin(policeReports, eq(crimeReports.id, policeReports.crimeId))
        .leftJoin(policeOfficers, eq(policeReports.officerId, policeOfficers.id));
      
      // Apply filters
      if (type && type !== 'all_types') {
        query = query.where(eq(crimeReports.typeOfCrime, type as string));
      }
      
      if (status && status !== 'all_statuses') {
        query = query.where(eq(crimeReports.arrestStatus, status as string));
      }
      
      if (dateRange) {
        const [startDate, endDate] = (dateRange as string).split(' - ');
        if (startDate && endDate) {
          query = query.where(
            and(
              gte(crimeReports.date, new Date(startDate)),
              lte(crimeReports.date, new Date(endDate))
            )
          );
        }
      }
      
      if (search) {
        query = query.where(
          or(
            like(crimeReports.description, `%${search}%`),
            like(crimeReports.id, `%${search}%`),
            like(locations.address, `%${search}%`)
          )
        );
      }
      
      const result = await query.orderBy(desc(crimeReports.date));
      res.json(result);
    } catch (error) {
      console.error('Error fetching crimes:', error);
      res.status(500).json({ error: 'Failed to fetch crimes' });
    }
  });
  
  // Get single crime details with associated data
  app.get('/api/crimes/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get crime details
      const crimeResult = await db
        .select({
          id: crimeReports.id,
          date: crimeReports.date,
          description: crimeReports.description,
          type: crimeReports.typeOfCrime,
          status: crimeReports.arrestStatus,
          locationId: crimeReports.locationId,
        })
        .from(crimeReports)
        .where(eq(crimeReports.id, id))
        .limit(1);
      
      if (crimeResult.length === 0) {
        return res.status(404).json({ error: 'Crime not found' });
      }
      
      const crime = crimeResult[0];
      
      // Get location data
      const locationResult = await db
        .select()
        .from(locations)
        .where(eq(locations.id, crime.locationId))
        .limit(1);
      
      // Get police report data
      const policeReportResult = await db
        .select({
          id: policeReports.id,
          date: policeReports.date,
          outcome: policeReports.outcome,
          officerId: policeReports.officerId,
        })
        .from(policeReports)
        .where(eq(policeReports.crimeId, id))
        .limit(1);
      
      // Get officer data if police report exists
      let officerResult = [];
      if (policeReportResult.length > 0) {
        officerResult = await db
          .select()
          .from(policeOfficers)
          .where(eq(policeOfficers.id, policeReportResult[0].officerId))
          .limit(1);
      }
      
      // Get weather data for the crime date
      const weatherResult = await db
        .select()
        .from(weatherData)
        .where(eq(weatherData.date, crime.date))
        .limit(1);
      
      // Get social media posts near the crime date
      const datePlus1 = new Date(crime.date);
      datePlus1.setDate(datePlus1.getDate() + 1);
      
      const dateMinus1 = new Date(crime.date);
      dateMinus1.setDate(dateMinus1.getDate() - 1);
      
      const socialMediaResult = await db
        .select()
        .from(socialMedia)
        .where(
          and(
            gte(socialMedia.date, dateMinus1.toISOString()),
            lte(socialMedia.date, datePlus1.toISOString())
          )
        )
        .limit(1);
      
      // Construct the complete response
      const response = {
        ...crime,
        location: locationResult[0] || null,
        policeReport: policeReportResult[0] || null,
        officer: officerResult[0] || null,
        weather: weatherResult[0] || null,
        socialMedia: socialMediaResult[0] || null,
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching crime details:', error);
      res.status(500).json({ error: 'Failed to fetch crime details' });
    }
  });
  
  // Export crimes as CSV
  app.post('/api/export-crimes', async (req, res) => {
    try {
      const { type, status, dateRange, search } = req.body;
      
      let query = db
        .select({
          id: crimeReports.id,
          date: crimeReports.date,
          description: crimeReports.description,
          type: crimeReports.typeOfCrime,
          status: crimeReports.arrestStatus,
          address: locations.address,
          locationId: locations.id,
          officerName: policeOfficers.name,
        })
        .from(crimeReports)
        .leftJoin(locations, eq(crimeReports.locationId, locations.id))
        .leftJoin(policeReports, eq(crimeReports.id, policeReports.crimeId))
        .leftJoin(policeOfficers, eq(policeReports.officerId, policeOfficers.id));
      
      // Apply filters (same as in /api/crimes)
      if (type) {
        query = query.where(eq(crimeReports.typeOfCrime, type));
      }
      
      if (status) {
        query = query.where(eq(crimeReports.arrestStatus, status));
      }
      
      if (dateRange) {
        const [startDate, endDate] = dateRange.split(' - ');
        if (startDate && endDate) {
          query = query.where(
            and(
              gte(crimeReports.date, new Date(startDate)),
              lte(crimeReports.date, new Date(endDate))
            )
          );
        }
      }
      
      if (search) {
        query = query.where(
          or(
            like(crimeReports.description, `%${search}%`),
            like(crimeReports.id, `%${search}%`),
            like(locations.address, `%${search}%`)
          )
        );
      }
      
      const result = await query.orderBy(desc(crimeReports.date));
      
      // Convert to CSV
      const header = "Crime ID,Date,Description,Type,Status,Address,Officer\n";
      const csvRows = result.map(row => 
        `"${row.id}","${formatDate(row.date)}","${row.description.replace(/"/g, '""')}","${row.type}","${row.status}","${row.address}","${row.officerName || ''}"`
      );
      
      const csv = header + csvRows.join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=crime_reports.csv');
      res.send(csv);
    } catch (error) {
      console.error('Error exporting crimes:', error);
      res.status(500).json({ error: 'Failed to export crimes' });
    }
  });
  
  // Locations with filtering
  app.get('/api/locations', async (req, res) => {
    try {
      const { type, search } = req.query;
      
      // Subquery to count crimes per location
      const subquery = db
        .select({
          locationId: crimeReports.locationId,
          crimeCount: count(),
        })
        .from(crimeReports)
        .groupBy(crimeReports.locationId)
        .as('crime_counts');
      
      let query = db
        .select({
          id: locations.id,
          address: locations.address,
          geolocation: locations.geolocation,
          typeOfAddress: locations.typeOfAddress,
          crimeCount: subquery.crimeCount,
        })
        .from(locations)
        .leftJoin(subquery, eq(locations.id, subquery.locationId));
      
      // Apply filters
      if (type && type !== 'all_types') {
        query = query.where(eq(locations.typeOfAddress, type as string));
      }
      
      if (search) {
        query = query.where(
          or(
            like(locations.address, `%${search}%`),
            like(locations.id, `%${search}%`)
          )
        );
      }
      
      const result = await query.orderBy(locations.id);
      res.json(result);
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ error: 'Failed to fetch locations' });
    }
  });
  
  // Officers with filtering
  app.get('/api/officers', async (req, res) => {
    try {
      const { position, area, search } = req.query;
      
      // Subquery to count cases per officer
      const subquery = db
        .select({
          officerId: policeReports.officerId,
          caseCount: count(),
        })
        .from(policeReports)
        .groupBy(policeReports.officerId)
        .as('case_counts');
      
      let query = db
        .select({
          id: policeOfficers.id,
          name: policeOfficers.name,
          position: policeOfficers.position,
          assignedArea: policeOfficers.assignedArea,
          caseCount: subquery.caseCount,
        })
        .from(policeOfficers)
        .leftJoin(subquery, eq(policeOfficers.id, subquery.officerId));
      
      // Apply filters
      if (position && position !== 'all_positions') {
        query = query.where(eq(policeOfficers.position, position as string));
      }
      
      if (area && area !== 'all_areas') {
        query = query.where(eq(policeOfficers.assignedArea, area as string));
      }
      
      if (search) {
        query = query.where(
          or(
            like(policeOfficers.name, `%${search}%`),
            like(policeOfficers.id, `%${search}%`)
          )
        );
      }
      
      const result = await query.orderBy(policeOfficers.name);
      res.json(result);
    } catch (error) {
      console.error('Error fetching officers:', error);
      res.status(500).json({ error: 'Failed to fetch officers' });
    }
  });
  
  // Officer statistics
  app.get('/api/officer-stats', async (req, res) => {
    try {
      // Officers by position
      const byPosition = await db
        .select({
          position: policeOfficers.position,
          count: count(),
        })
        .from(policeOfficers)
        .groupBy(policeOfficers.position);
      
      // Top officers by case count
      const topOfficers = await db
        .select({
          id: policeOfficers.id,
          name: policeOfficers.name,
          count: count(policeReports.id),
        })
        .from(policeOfficers)
        .leftJoin(policeReports, eq(policeOfficers.id, policeReports.officerId))
        .groupBy(policeOfficers.id, policeOfficers.name)
        .orderBy(desc(count(policeReports.id)))
        .limit(10);
      
      const response = {
        byPosition,
        topOfficers
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching officer stats:', error);
      res.status(500).json({ error: 'Failed to fetch officer statistics' });
    }
  });
  
  // Social media posts with filtering
  app.get('/api/social-media', async (req, res) => {
    try {
      const { sentiment, location, dateRange, search } = req.query;
      
      let query = db
        .select()
        .from(socialMedia);
      
      // Apply filters
      if (sentiment && sentiment !== 'all_sentiments') {
        query = query.where(eq(socialMedia.sentiment, sentiment as string));
      }
      
      if (location && location !== 'all_locations') {
        query = query.where(eq(socialMedia.location, location as string));
      }
      
      if (dateRange) {
        const [startDate, endDate] = (dateRange as string).split(' - ');
        if (startDate && endDate) {
          query = query.where(
            and(
              gte(socialMedia.date, new Date(startDate)),
              lte(socialMedia.date, new Date(endDate))
            )
          );
        }
      }
      
      if (search) {
        query = query.where(like(socialMedia.content, `%${search}%`));
      }
      
      const result = await query.orderBy(desc(socialMedia.date));
      res.json(result);
    } catch (error) {
      console.error('Error fetching social media posts:', error);
      res.status(500).json({ error: 'Failed to fetch social media posts' });
    }
  });
  
  // Social media sentiment analysis
  app.get('/api/social-media-stats', async (req, res) => {
    try {
      // Posts by sentiment
      const bySentiment = await db
        .select({
          sentiment: socialMedia.sentiment,
          count: count(),
        })
        .from(socialMedia)
        .groupBy(socialMedia.sentiment);
      
      // Posts by location
      const byLocation = await db
        .select({
          location: socialMedia.location,
          count: count(),
        })
        .from(socialMedia)
        .groupBy(socialMedia.location)
        .orderBy(desc(count()))
        .limit(10);
      
      // Posts over time
      const postsOverTime = await db.execute(sql`
        SELECT
          TO_CHAR(date, 'Mon YYYY') as month,
          EXTRACT(YEAR FROM date) as year,
          EXTRACT(MONTH FROM date) as month_num,
          sentiment,
          COUNT(*) as count
        FROM
          social_media
        GROUP BY
          TO_CHAR(date, 'Mon YYYY'),
          EXTRACT(YEAR FROM date),
          EXTRACT(MONTH FROM date),
          sentiment
        ORDER BY
          year, month_num
      `);
      
      const response = {
        bySentiment,
        byLocation,
        postsOverTime: postsOverTime.rows
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching social media stats:', error);
      res.status(500).json({ error: 'Failed to fetch social media statistics' });
    }
  });
  
  // Weather data with filtering
  app.get('/api/weather', async (req, res) => {
    try {
      const { dateRange, search } = req.query;
      
      let query = db
        .select()
        .from(weatherData);
      
      // Apply filters
      if (dateRange) {
        const [startDate, endDate] = (dateRange as string).split(' - ');
        if (startDate && endDate) {
          query = query.where(
            and(
              gte(weatherData.date, new Date(startDate)),
              lte(weatherData.date, new Date(endDate))
            )
          );
        }
      }
      
      if (search) {
        query = query.where(
          or(
            like(weatherData.temperature, `%${search}%`),
            like(weatherData.precipitation, `%${search}%`),
            like(weatherData.windSpeed, `%${search}%`)
          )
        );
      }
      
      const result = await query.orderBy(desc(weatherData.date));
      res.json(result);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  });
  
  // Weather and crime correlation analysis
  app.get('/api/weather-crime-stats', async (req, res) => {
    try {
      // Get crime counts per date
      const crimesPerDate = await db
        .select({
          date: crimeReports.date,
          count: count(),
        })
        .from(crimeReports)
        .groupBy(crimeReports.date);
      
      // Get weather data per date
      const weatherResult = await db
        .select()
        .from(weatherData)
        .orderBy(weatherData.date);
      
      // Map of dates to crime counts
      const crimeDateMap = new Map();
      crimesPerDate.forEach(item => {
        crimeDateMap.set(formatDate(item.date), item.count);
      });
      
      // Combine weather data with crime counts
      const combinedData = weatherResult.map(weather => {
        const dateStr = formatDate(weather.date);
        return {
          date: dateStr,
          temperature: weather.temperature,
          precipitation: weather.precipitation,
          windSpeed: weather.windSpeed,
          crimeCount: crimeDateMap.get(dateStr) || 0
        };
      });
      
      // Precipitation analysis
      const precipitationData = await db.execute(sql`
        SELECT 
          CASE 
            WHEN CAST(REPLACE(w.precipitation, ' in', '') AS float) = 0 THEN 'No Precipitation'
            WHEN CAST(REPLACE(w.precipitation, ' in', '') AS float) <= 0.2 THEN 'Light (0-0.2 in)'
            WHEN CAST(REPLACE(w.precipitation, ' in', '') AS float) <= 0.5 THEN 'Moderate (0.2-0.5 in)'
            ELSE 'Heavy (>0.5 in)'
          END as precipitation_category,
          COUNT(c.crime_id) as crime_count
        FROM 
          weather_data w
        JOIN 
          crime_reports c ON w.date = c.date
        GROUP BY 
          precipitation_category
        ORDER BY 
          precipitation_category
      `);
      
      // Temperature analysis
      const temperatureData = await db.execute(sql`
        SELECT 
          CASE 
            WHEN CAST(REPLACE(w.temperature, '°F', '') AS float) < 32 THEN 'Freezing (<32°F)'
            WHEN CAST(REPLACE(w.temperature, '°F', '') AS float) <= 50 THEN 'Cold (32-50°F)'
            WHEN CAST(REPLACE(w.temperature, '°F', '') AS float) <= 70 THEN 'Moderate (50-70°F)'
            ELSE 'Hot (>70°F)'
          END as temperature_category,
          COUNT(c.crime_id) as crime_count
        FROM 
          weather_data w
        JOIN 
          crime_reports c ON w.date = c.date
        GROUP BY 
          temperature_category
        ORDER BY 
          temperature_category
      `);
      
      const response = {
        weatherCrimeData: combinedData,
        precipitationAnalysis: precipitationData.rows,
        temperatureAnalysis: temperatureData.rows
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching weather-crime stats:', error);
      res.status(500).json({ error: 'Failed to fetch weather-crime statistics' });
    }
  });
  
  // Helper function for date formatting
  function formatDate(date: Date | string): string {
    if (!date) return '';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }
  
  // Helper function for OR conditions
  function or(...conditions: any[]) {
    return sql`(${sql.join(conditions, sql` OR `)})`;
  }

  return httpServer;
}
