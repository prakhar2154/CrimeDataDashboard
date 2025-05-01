import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="p-6">
      <Card className="bg-secondary rounded-lg p-8 max-w-4xl mx-auto">
        <h2 className="text-3xl font-montserrat font-semibold mb-6 text-center">About Our Project</h2>
        
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-primary bg-opacity-30 rounded-lg" 
               style={{ backgroundImage: "linear-gradient(to bottom right, rgba(30, 58, 138, 0.3), rgba(153, 27, 27, 0.2))" }}>
          </div>
          <div className="w-full h-48 rounded-lg bg-[url('https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-icons text-accent text-6xl">travel_explore</span>
          </div>
        </div>
        
        <CardContent className="px-0 py-0">
          <p className="text-gray-300 mb-4 leading-relaxed">
            The Crime Data Analysis Dashboard is a cutting-edge tool designed to empower users with deep insights into crime patterns and trends. Built to analyze data from various locations and time periods, our platform allows users to explore crime incidents, their locations, and related factors like weather and public sentiment.
          </p>
          
          <p className="text-gray-300 mb-6 leading-relaxed">
            We provide interactive tables and dynamic charts to dissect crime types, arrest outcomes, geographic distributions, and correlations with external factors. From understanding theft trends in residential areas to analyzing assault rates during specific weather conditions, our dashboard delivers clear, data-driven answers. Explore the data, uncover hidden patterns, and make informed decisions with our comprehensive analysis tools.
          </p>
          
          <h3 className="text-xl font-montserrat font-medium mb-4">Key Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-accent bg-opacity-10 flex items-center justify-center mr-3">
                  <span className="material-icons text-accent">bar_chart</span>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">Interactive Visualization</h4>
                  <p className="text-sm text-gray-400">Dynamic charts and graphs for intuitive data analysis</p>
                </div>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-accent bg-opacity-10 flex items-center justify-center mr-3">
                  <span className="material-icons text-accent">map</span>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">Geospatial Mapping</h4>
                  <p className="text-sm text-gray-400">Visualize crime hotspots and location patterns</p>
                </div>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-accent bg-opacity-10 flex items-center justify-center mr-3">
                  <span className="material-icons text-accent">filter_alt</span>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">Advanced Filtering</h4>
                  <p className="text-sm text-gray-400">Narrow down data by multiple parameters</p>
                </div>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-accent bg-opacity-10 flex items-center justify-center mr-3">
                  <span className="material-icons text-accent">cloud_download</span>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">Export Functionality</h4>
                  <p className="text-sm text-gray-400">Download reports and visualizations</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/">
              <Button 
                variant="destructive"
                className="inline-flex items-center px-6 py-3 bg-destructive hover:bg-destructive/90 text-white font-medium rounded-md transition-colors duration-200"
              >
                Explore Dashboard
                <span className="material-icons ml-2">arrow_forward</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
