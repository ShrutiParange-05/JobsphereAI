interface DemographicsProps {
  genderData: {
    male: number;
    female: number;
  };
  ageData: {
    label: string;
    percentage: number;
  }[];
}

export function Demographics({ genderData, ageData }: DemographicsProps) {
  return (
    <div className="rounded-lg bg-gray-900 border border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Skill Demographics
      </h3>
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-400 mb-2">Gender Distribution</p>
          <div className="flex gap-4 items-center">
            <div
              className="h-2 flex-1 bg-blue-500 rounded"
              style={{ width: `${genderData.male}%` }}
            />
            <span className="text-sm text-gray-400">
              {genderData.male}% Male
            </span>
            <div
              className="h-2 flex-1 bg-pink-500 rounded"
              style={{ width: `${genderData.female}%` }}
            />
            <span className="text-sm text-gray-400">
              {genderData.female}% Female
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-2">Age Groups</p>
          <div className="space-y-2">
            {ageData.map((age) => (
              <div key={age.label} className="flex items-center gap-2">
                <div className="w-16 text-sm text-gray-400">{age.label}</div>
                <div className="flex-1 h-2 bg-gray-800 rounded-full">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${age.percentage}%` }}
                  />
                </div>
                <div className="w-12 text-sm text-gray-400 text-right">
                  {age.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
