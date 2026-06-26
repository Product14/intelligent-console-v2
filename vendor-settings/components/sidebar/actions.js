import axios from 'axios';

export const getDealerConfig = async (enterpriseID, teamId) => {
  try {
    const resp = await axios.get(
      `${process.env.WEBSITE_BACKEND}/dealers/v1/config?enterprise_id=${enterpriseID}&team_id=${teamId}`
    );
    const result = resp.data.data;
    return result;
  } catch (error) {
    console.log('Error:', error);
  }
};

export async function generateVinDescription({ enterpriseId, teamId, vin }) {
  const url = `${process.env.WEBSITE_BACKEND}/inventory/v1/vins/generate-vin-description`; // Replace with your API endpoint

  const payload = {
    enterprise_id: enterpriseId,
    team_id: teamId,
    vin: vin,
  };

  try {
    const response = await fetch(url, {
      method: 'POST', // Send a POST request
      body: JSON.stringify(payload), // Convert payload to JSON
    });

    if (!response.ok) {
      throw new Error('Failed to generate VIN description.');
    }

    const data = await response.json(); // Parse the JSON response
    return data; // Return the data (could be the generated description)
  } catch (error) {
    console.error('Error generating VIN description:', error);
    throw error;
  }
}
