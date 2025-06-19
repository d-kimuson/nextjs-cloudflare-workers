import { CalendarDays, Globe, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface MakerProfileProps {
  maker: {
    name: string;
    description?: string;
    website?: string;
    location?: string;
    foundedDate?: string;
    avatar?: string;
  };
}

export function MakerProfile({ maker }: MakerProfileProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {maker.avatar ? (
              <img
                src={maker.avatar}
                alt={maker.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              maker.name.charAt(0)
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{maker.name}</h1>
            <p className="text-sm text-gray-600 font-normal">制作者</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {maker.description && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              プロフィール
            </h3>
            <p className="text-gray-600 leading-relaxed">{maker.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          {maker.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">拠点:</span>
              <span>{maker.location}</span>
            </div>
          )}

          {maker.foundedDate && (
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">設立:</span>
              <span>{formatDate(maker.foundedDate)}</span>
            </div>
          )}

          {maker.website && (
            <div className="flex items-center gap-2 text-sm md:col-span-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">ウェブサイト:</span>
              <a
                href={maker.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {maker.website}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
