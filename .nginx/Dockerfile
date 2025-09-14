# Use the official Nginx image as the base image
FROM nginx:alpine

# Set working directory
WORKDIR /app

# Copy the static files to the default Nginx web directory
COPY ./ /usr/share/nginx/html

# Copy a custom Nginx configuration file if needed
# Uncomment the following lines if you want to include a custom config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 to serve the application
EXPOSE 80

# Command to start Nginx
CMD ["nginx", "-g", "daemon off;"]
