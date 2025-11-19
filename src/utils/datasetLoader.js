import Papa from 'papaparse'

let datasetCache = null

export async function loadDataset() {
  if (datasetCache) {
    return datasetCache
  }

  try {
    const response = await fetch('/us_students_dataset_1500.csv')
    const text = await response.text()
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Transform CSV data to user-friendly format
          const users = results.data.map((row, index) => ({
            id: `dataset_${index}`,
            registrationNumber: row['Registration Number'],
            firstName: row['First Name'],
            middleName: row['Middle Name'],
            lastName: row['Last Name'],
            gender: row['Gender'],
            dateOfBirth: row['Date of Birth'],
            nationality: row['Nationality'],
            countryOfResidence: row['Country of Residence'],
            phoneNumber: row['Phone Number'],
            email: row['Email Address'],
            homeAddress: row['Home Address'],
            city: row['City'],
            state: row['State'],
            zipCode: row['Zip Code'],
            university: row['University'],
            currentGPA: row['Current GPA / CGPA'],
            creditsCompleted: row['Credits Completed'],
            creditsRemaining: row['Credits Remaining'],
            coursesEnrolled: row['Courses Enrolled Per Semester'],
            courseCodes: row['Course Codes'],
            courseUnits: row['Course Units'],
            technicalSkills: row['Technical Skills'] || '',
            softSkills: row['Soft Skills'] || '',
            researchInterests: row['Research Interests'] || '',
            professionalInterests: row['Professional Interests'] || '',
            hobbies: row['Hobbies'] || '',
            preferredLearningStyle: row['Preferred Learning Style'] || '',
            studyPartnersPreferences: row['Study Partners Preferences'] || '',
            preferredStudyHours: row['Preferred Study Hours'] || '',
            csInterests: row['CS and Data Science Interests'] || '',
            isFromDataset: true,
            studyStats: {
              totalHours: Math.floor(Math.random() * 200) + 50,
              weeklyHours: Array.from({ length: 7 }, () => Math.floor(Math.random() * 8) + 2),
              sessionsCompleted: Math.floor(Math.random() * 100) + 20,
              studyProgress: Math.floor(Math.random() * 80) + 10
            }
          }))
          
          datasetCache = users
          resolve(users)
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  } catch (error) {
    console.error('Error loading dataset:', error)
    return []
  }
}

export function getDatasetUsers() {
  return datasetCache || []
}

