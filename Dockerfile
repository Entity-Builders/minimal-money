FROM node:20-alpine

WORKDIR /app

# Install global packages needed for Expo
RUN npm install -g expo-cli @expo/ngrok

# Expose standard Expo ports
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002
EXPOSE 8081

# Default command (can be overridden in docker-compose)
CMD ["yarn", "start"]
