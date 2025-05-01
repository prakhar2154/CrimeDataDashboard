import { Card, CardContent } from "@/components/ui/card";

export default function MadeBy() {
  return (
    <div className="p-6">
      <Card className="bg-secondary rounded-lg p-8 max-w-xl mx-auto">
        <h2 className="text-3xl font-montserrat font-semibold mb-6 text-center">Made By</h2>
        
        <CardContent className="px-0 py-0">
          <div className="flex justify-center mb-8">
            <div className="flex space-x-6">
              <div className="flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-destructive-dark border-2 border-destructive flex items-center justify-center mb-3">
                  <span className="text-2xl font-montserrat font-bold text-white">PP</span>
                </div>
                <p className="text-accent font-medium">Prakhar Prakash</p>
                <p className="text-sm text-gray-400">RA2311003011382</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-destructive-dark border-2 border-destructive flex items-center justify-center mb-3">
                  <span className="text-2xl font-montserrat font-bold text-white">SS</span>
                </div>
                <p className="text-accent font-medium">Shagun Sinha</p>
                <p className="text-sm text-gray-400">RA2311003011386</p>
              </div>
            </div>
          </div>
          
          <p className="text-center text-gray-300 mb-6">
            We are dedicated to harnessing data for impactful insights. Thank you for exploring our Crime Data Analysis Dashboard!
          </p>
          
          <div className="border-t border-muted pt-6 text-center">
            <p className="text-sm text-gray-400">
              © 2025 Crime Data Analysis Project
            </p>
            <div className="flex justify-center space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-accent transition-colors duration-150" aria-label="Email">
                <span className="material-icons">email</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors duration-150" aria-label="Code">
                <span className="material-icons">code</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors duration-150" aria-label="School">
                <span className="material-icons">school</span>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
