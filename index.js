require('dotenv').config();
const axios = require('axios');

// Load multiple tokens from environment variables
const BEARER_TOKENS = process.env.TOKENS.split('\n');

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
    for (const token of BEARER_TOKENS) {
      if (token.trim() === '') continue; // Skip empty lines

      const USER_ID = token.split('-')[0]; // Extract user ID from token

      const tasksToClear = await getTasks(USER_ID, token);

      for (const taskId of tasksToClear) {
        await clearTask(USER_ID, taskId, token);
      }

      console.log(
        `All tasks have been cleared for user ${USER_ID}, congrats! Follow: https://twitter.com/WinNode`
      );
    }
  } catch (error) {
    console.log(
      'Error in Clear Tasks: ' +
        (error.response?.data?.message || error.response)
    );
  }
})();
