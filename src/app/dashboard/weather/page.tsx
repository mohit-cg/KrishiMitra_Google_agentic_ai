import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, CloudSun, Wind, Droplets } from "lucide-react";

const forecastData = [
  { day: "Today", temp: "31°C", condition: "Partly Cloudy", icon: CloudSun },
  { day: "Tuesday", temp: "32°C", condition: "Sunny", icon: Sun },
  { day: "Wednesday", temp: "30°C", condition: "Rainy", icon: CloudRain },
  { day: "Thursday", temp: "33°C", condition: "Sunny", icon: Sun },
  { day: "Friday", temp: "29°C", condition: "Showers", icon: CloudRain },
  { day: "Saturday", temp: "31°C", condition: "Cloudy", icon: Cloud },
  { day: "Sunday", temp: "32°C", condition: "Partly Cloudy", icon: CloudSun },
];

export default function WeatherPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">Live Weather Forecast</h1>
      <p className="text-muted-foreground mb-8">
        7-day forecast for Pune, Maharashtra. Plan your farming activities accordingly.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Current Weather</CardTitle>
          <CardDescription>Right now in Pune</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-8">
          <CloudSun className="h-24 w-24 text-accent" />
          <div>
            <p className="text-6xl font-bold">31°C</p>
            <p className="text-muted-foreground">Partly Cloudy</p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center"><Wind className="mr-2 h-4 w-4" /> Wind: 12 km/h</p>
            <p className="flex items-center"><Droplets className="mr-2 h-4 w-4" /> Humidity: 55%</p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 font-headline">Weekly Forecast</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {forecastData.map((day, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">{day.day}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-2">
                <day.icon className="h-10 w-10 text-accent" />
                <p className="text-xl font-semibold">{day.temp}</p>
                <p className="text-sm text-muted-foreground">{day.condition}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
