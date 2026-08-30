# Job Portal Backend App
    - 3 Roles: Job Seeker, Employer, Admin
    - User Authentication(Login) & Logout
    - Protected Routes
    - Role Based Access Control( RBAC )
    - Job posting & application management
    - Embedded documents(skills, education, salaryRange) & Referenced documents(employer, job, applicant)




JOBSEEKER Role can :
        ✅ Register (SignUp)
        ✅ Login(SignIn) ( Authentication )
        ✅ View own profile
        ✅ Update own profile
        ✅ View all open jobs
        ✅ View a single job by id
        ✅ Apply for a job
        ✅ View own submitted applications
        ✅ View status of own application

EMPLOYER Role can :
        ✅ Register (SignUp)
        ✅ Login(SignIn) ( Authentication )
        ✅ Create a job posting
        ✅ View own job postings
        ✅ View a single own job posting
        ✅ Update own job posting
        ✅ Delete own job posting
        ✅ View applications received for own jobs
        ✅ Update status of an application(shortlisted/rejected/accepted...)

ADMIN Role can :
        ✅ Login(SignIn) ( Authentication )
        ✅ View all users
        ✅ View a user by id
        ✅ Activate/Deactivate users
        ✅ Delete a user
        ✅ View all job postings(any status)
        ✅ View a job posting by id
        ✅ Remove inappropriate/invalid job postings

    Admin account is not self-service. Register a normal user, then set
    role:"ADMIN" directly in the database (mongo shell / Compass).




# Register ( User Registration )
    POST /auth-api/register
    {
        name:"Test seeker",
        email:"seeker@mail.com",
        password:"test123",
        role:"JOBSEEKER"          --> or "EMPLOYER", anything else defaults to JOBSEEKER
    }

    hashing( irreversable) ---> module : bcryptjs


# Login ( Authentication )
    POST /auth-api/login
    {
        email:"",
        password:""
    }
    ---> Backend verifies credentials, signs JWT, sets it as httpOnly cookie "accessToken"

    module : jsonwebtoken


# Logout
    POST /auth-api/logout
    ---> clears the "accessToken" cookie


                    req
Client req ---->HTTP server ------>REST API ----->public route  --->send res
                   req+token            |
                                        | -- verification process-->protected routes


# Routes

## Auth (public)
    POST    /auth-api/register
    POST    /auth-api/login
    POST    /auth-api/logout

## Job Seeker (protected, role: JOBSEEKER)
    GET     /jobseeker-api/profile
    PUT     /jobseeker-api/profile
    GET     /jobseeker-api/jobs
    GET     /jobseeker-api/jobs/:id
    POST    /jobseeker-api/jobs/:id/apply
    GET     /jobseeker-api/applications
    GET     /jobseeker-api/applications/:id

## Employer (protected, role: EMPLOYER)
    POST    /employer-api/jobs
    GET     /employer-api/jobs
    GET     /employer-api/jobs/:id
    PUT     /employer-api/jobs/:id
    DELETE  /employer-api/jobs/:id
    GET     /employer-api/jobs/:id/applications
    PUT     /employer-api/applications/:id/status

## Admin (protected, role: ADMIN)
    GET     /admin-api/users
    GET     /admin-api/users/:id
    PUT     /admin-api/users/:id/status
    DELETE  /admin-api/users/:id
    GET     /admin-api/jobs
    GET     /admin-api/jobs/:id
    DELETE  /admin-api/jobs/:id


# Database design
    User        --> account, auth, role + embedded profile(skills[], education[], companyName...)
    Job         --> job posting + embedded(salaryRange, requiredSkills[]) + reference(employer -> User)
    Application --> reference(job -> Job, applicant -> User) + embedded(coverLetter, status)

    unique index on {job, applicant} in ApplicationModel
        --> stops a job seeker applying to the same job twice


# Server status codes
    200 → Successful request
    201 → Resource created
    400 → Invalid request
    401 → Not authenticated / invalid token / accessing someone else's resource
    403 → Authenticated but insufficient permission
    404 → User/Job/Application not found
    409 → Duplicate email
    500 → Unexpected server error


# Extract token from req
    cookie-parser


# Run locally
    1. npm install
    2. make sure mongod is running on mongodb://localhost:27017
    3. node server.js
    4. import the Postman collection and test each role's flow
