require('dotenv').config();
const axios = require('axios');

// Load multiple tokens from environment variables
const TOKENS = Object.keys(process.env)
  .filter(key => key.startsWith('TOKEN_'))
  .map(key => process.env[key]);

async function getTasks(userId, bearerToken) {
  try {
    const { data } = await axios({
      url: `https://lb.backend-sidequest.rcade.game/users/${userId}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });

    const tasksToClear = Object.values(data.user.quests);

    const uniqueTaskIds = data.quests.reduce((uniqueIds, quest) => {
      if (!tasksToClear.includes(quest._id)) {
        uniqueIds.push(quest._id);
      }
      return uniqueIds;
    }, []);

    return uniqueTaskIds;
  } catch (error) {
    console.log('Error in Get Tasks: ' + error.response.data.message);
    return [];
  }
}

async function clearTask(userId, taskId, bearerToken) {
  try {
    const { data } = await axios({
      url: `https://lb.backend-sidequest.rcade.game/users/${userId}/quests/${taskId}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });

    console.log(
      `Task with ID ${taskId} has been cleared for user ${userId}! Their points now:`,
      data.user.points
    );
  } catch (error) {
    console.log(
      `Error in Clear Task with ID ${taskId} for user ${userId}: ` + error.response.data.message
    );
  }
}

(async () => {
  try {
    for (let i = 0; i < TOKENS.length; i++) {
      const token = TOKENS[i];
      if (!token) continue; // Skip empty or undefined tokens

      const USER_ID = token.split('-')[0]; // Extract user ID from token

      const tasksToClear = await getTasks(USER_ID, token);

      for (const taskId of tasksToClear) {
        await clearTask(USER_ID, taskId, token);
      }

      console.log(
        `All tasks have been cleared for user ${USER_ID}, using token ${i + 1}, congrats! Follow: https://twitter.com/WinNode`
      );
    }
  } catch (error) {
    console.log(
      'Error in Clear Tasks: ' +
        (error.response?.data?.message || error.response)
    );
  }
})();
