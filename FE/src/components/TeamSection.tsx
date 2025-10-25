/* eslint-disable @next/next/no-img-element */
import React from "react";

interface TeamMemberProps {
  name: string;
  role: string;
  graduation: string;
  imageUrl: string;
  linkedinUrl: string;
  githubUrl: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({
  name,
  role,
  graduation,
  imageUrl,
  linkedinUrl,
  githubUrl,
}) => (
  <div
    id="team"
    className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
  >
    {/* Profile Image - FIXED FOR ALL MEMBERS */}
    <div className="w-32 h-32 mb-4 relative">
      <div className="w-full h-full rounded-full overflow-hidden border-4 border-blue-100 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full"
          style={{
            objectFit: 'cover',
            objectPosition: 'center 20%', // Adjust vertical position
          }}
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.src = '/placeholder-avatar.png';
          }}
        />
      </div>
      {/* Online Status Indicator */}
      <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
    </div>

    {/* Name */}
    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{name}</h3>
    
    {/* Role - Fixed height to prevent layout shift */}
    <div className="h-12 flex items-center justify-center mb-3">
      <p className="text-blue-600 font-medium text-center leading-tight px-2">
        {role}
      </p>
    </div>

    {/* Graduation */}
    <div className="flex items-center gap-2 text-gray-600 mb-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-gray-500"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
      </svg>
      <span className="text-sm font-semibold">{graduation}</span>
    </div>

    {/* Social Links */}
    <div className="flex gap-4">
      {linkedinUrl && (
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative"
          aria-label={`${name}'s LinkedIn`}
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-50 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </div>
        </a>
      )}
      
      {githubUrl && (
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative"
          aria-label={`${name}'s GitHub`}
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-50 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </div>
        </a>
      )}
    </div>
  </div>
);

interface TeamSectionProps {
  id?: string;
}

const TeamSection: React.FC<TeamSectionProps> = ({ id }) => {
  const teamMembers = [
    {
      name: "Moinuddin Quazi",
      role: "AI/ML & Full Stack Developer",
      graduation: "TEC'26",
      imageUrl: "/moin.png",
      linkedinUrl: "https://www.linkedin.com/in/md-moinuddin-quazi-7a5942244/",
      githubUrl: "https://github.com/kmoin1309",
    },
    {
      name: "Shruti Parange",
      role: "Full Stack Developer & UI/UX Designer",
      graduation: "TEC'26",
      imageUrl: "/shruti.jpeg",
      linkedinUrl: "https://www.linkedin.com/in/shruti-parange-b9a02b341/",
      githubUrl: "https://github.com/ShrutiParange-05",
    },
    {
      name: "Sanika Zagade",
      role: "Web Developer & Graphic Designer",
      graduation: "TEC'26",
      imageUrl: "/sanika.jpeg",
      linkedinUrl: "https://www.linkedin.com/in/sanika-zagade0729/",
      githubUrl: "https://github.com/Sanika0729",
    },
    {
      name: "Sarika Katkar",
      role: "Data Analyst",
      graduation: "TEC'26",
      imageUrl: "/sarika1.jpg",
      linkedinUrl: "https://www.linkedin.com/in/sarika-katkar/",
      githubUrl: "https://github.com/SarikaKatkar",
    },
  ];

  return (
    <div id={id} className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
              Our Team
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Meet Our Team
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The brilliant minds behind JobSphereAI, bringing together expertise in development, data science, and design
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div 
              key={member.name}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <TeamMember {...member} />
            </div>
          ))}
        </div>
      </div>

      {/* Animation CSS */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default TeamSection;
