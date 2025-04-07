# gpt_stripe_demo

## In your front end

npm install @stripe/react-stripe-js @stripe/stripe-js


### Frontend environment variables

Add a .env file to your front end repository, then add your stripe public key
STRIPE_PUBLISHABLE_KEY=”sk_test_xxx…”

Note: you may need to just hardcode your publishable key into your app for development, but in production you don’t want to do this. For deploying somewhere like Vercel, you can set environment variables when you create your app. 

## In your backend:
pip install djangorestframework django-cors-headers openai python-dotenv stripe



Need to create an openai api key at platform.openai.com
Make sure your account has funds! Don’t add more than $5 or $10 to start, it takes a long time to go through credits. 
I recommend using the gpt-4o-mini model, it’s really cheap. 

### Backend Environment Variables

Add a .env file to your backend repository, then add your openai api key
OPENAI_API_KEY=”sk-proj-xxx…”
STRIPE_SECRET_KEY=”sk_test_xxx…”




### For Stripe:
1. You’ll have to create a stripe account. Go to dashboard.stripe.com
2. Answer all the sign up questions as best you can, you’ll likely have to verify your identity. It will make you provide a business email or
business phone number here for customer service inquiries. DO NOT PUT YOUR PERSONAL NUMBER. Either create a google voice account or a separate email address for customer service inquiries.
3. To get verified, you have to have a website URL to provide them that has a basic description of what your app does, they should easily be able to understand the purpose of the app. To do this, I just published a static front end on Vercel and shared that URL with them, you can view that here: colorlyai.com
- It may take a day or two to get verified. 
- To create this static website and publish it quickly, I recommend just using  a Vercel template and then modifying it:

### For Vercel:
1. Sign up with github at vercel.com, give it access to your repositories (I chose to select specific repositories to give it access to, depends on your privacy preference).
2. To publish your first basic web page that has a description of your app, just copy their example app and then publish that, modify it so that you can change it to say what your app does, and then you’ll get approved for stripe.
3. Go to your projects (“Overview” tab). Click “Add New”, then click "Project" from the dropdown. We will want to clone one of their templates. 
4. Click "Browse All Templates", then in the search bar type: "Create React App" and just use that template. You likely already have the node dependencies installed on your laptop from the course requirements. If not, you can select a python template. 
5. If you have your github account connected to vercel, it will automatically create a new repository in github with the example project. Open the project up and clone it to your IDE (VS Code or wherever), then you can modify this to have the basic front end or layout of your web page that makes it clear what your app/service does so you can get approved by stripe. Push the changes to github, and it should automatically update your Vercel deployment. 
6. Take the URL given for your vercel deployment and give that to stripe as your business web page to get approved. 
