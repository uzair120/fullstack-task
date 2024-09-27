### **Fullstack Job Execution Task**

#### **Outline:**

- [**Fullstack Job Execution Task**](#fullstack-job-execution-task)
  - [**Outline:**](#outline)
- [**Solution Design** {#solution-design}](#solution-design-solution-design)
  - [**Backend**](#backend)
  - [**Key Components**](#key-components)
- [**Improvements** {#improvements}](#improvements-improvements)
- [**Frontend** {#frontend}](#frontend-frontend)
- [**Bottlenecks \& Mitigations** {#bottlenecks-\&-mitigations}](#bottlenecks--mitigations-bottlenecks--mitigations)
- [**Future Improvements** {#future-improvements}](#future-improvements-future-improvements)
- [**Data for Pending and Completed Jobs** {#data-for-pending-and-completed-jobs}](#data-for-pending-and-completed-jobs-data-for-pending-and-completed-jobs)
- [**Screenshots** {#screenshots}](#screenshots-screenshots)
- [**Docker Setup Instructions** {#docker-setup-instructions}](#docker-setup-instructions-docker-setup-instructions)
- [**Setup Instructions Without Docker** {#setup-instructions-without-docker}](#setup-instructions-without-docker-setup-instructions-without-docker)
- [**Time Report** {#time-report}](#time-report-time-report)

We need to build a job execution system with the following key functionalities:

**Backend:**

* **POST /jobs:** Creates a new job, returning its ID.  
* **GET /jobs:** Fetches a list of all jobs. Resolved jobs return the job result; unresolved jobs return their status.  
* **GET /jobs/{jobId}:** Returns the result or status of a specific job.

**Job Definition:** Each job retrieves a random Unsplash food image, with execution delayed (between 5 seconds and 5 minutes, in 5-second steps).

**Frontend:**

* Display a list of jobs and their statuses or results.  
* Create new jobs.  
* Fetch and display job results once resolved.  
  ---

  ### **Solution Design** {#solution-design}

  #### **Backend**

**Framework:** I’ve used Node.js with Express.js to build the API. I implement an Event driven like system by using one service. 

**Data Storage:** I chose a file-based approach, adhering to the requirement to avoid a database. The design needs to handle multiple requests without conflicts.

#### **Key Components**

**1\. Job Management** Each job retrieves a random Unsplash food image, with a delay to simulate real-world job queue execution (from 5 seconds to 5 minutes).

**File Structure:**  
Each job is saved in a separate file, named as `jobId_status.json`. Upon job completion, the status changes from pending to completed or error, and the file is renamed accordingly with the final result.

**Why This Approach?**

* **Scalability:** Each job has its own file, avoiding bottlenecks from high traffic.  
* **Lock-free Operations:** Since each job is handled individually, there’s no risk of deadlocks from simultaneous read/write operations.  
* **Simplicity:** The file-based approach meets the requirements while remaining simple and scalable for moderate load.  
  ---

**2\. Handling High Load** To manage multiple job requests simultaneously:

* Asynchronous programming (Promises) handles I/O-bound tasks (file reads/writes, Unsplash API calls). This allows the system to process multiple jobs concurrently without blocking the event loop.  
  ---

**3\. Job Status Handling** When a job is requested, its current status is returned until resolved. Each job file is updated periodically, and the client polls the backend for updates.

**Why This Approach?**

* **Efficiency:** Polling lets the client know when a job is resolved.  
* **File-based Persistence:** Job results are saved to files, making them available even after a restart.  
  ---

**4\. Unsplash API Integration** For this task, I used the **unsplash-js** library, which simplifies interaction with the Unsplash API by abstracting much of the complexity.

---

### **Improvements** {#improvements}

**Issue to Handle:** When a job is created and in a pending state (waiting for the delay to finish before running), if the service restarts for any reason, the pending jobs will not be executed.

**Solution:** To solve this, we can use queues, Redis, or an in-service mechanism. I concluded that, in our case, we should introduce a mechanism where, upon service restart, all pending jobs are picked up and executed based on their remaining delay time. This ensures no jobs are missed even after a service restart.

---

### **Frontend** {#frontend}

**Framework:** I used React for the frontend, allowing a component-driven architecture to manage job creation and status/result display.

* **Job List:** The frontend polls the `/jobs` endpoint to fetch all jobs. Pending jobs show their status, and completed jobs display the Unsplash image.  
* **Create New Job:** A form allows users to create new jobs, triggering the backend POST request.  
* **Real-time Updates:** The frontend periodically polls the backend to check for job progress.  
  ---

  ### **Bottlenecks & Mitigations** {#bottlenecks-&-mitigations}

1. **High Load**  
   * **Bottleneck:** Multiple simultaneous jobs can slow down I/O operations.  
   * **Solution:** Asynchronous programming ensures the system remains responsive. For heavy loads, we could consider API throttling or using worker threads.  
2. **Unstable Internet Connection**  
   * **Bottleneck:** A poor internet connection can cause job creation or result retrieval to fail.  
   * **Solution:** The client retries failed requests, and jobs are persisted in the backend for future retrieval.  
3. **File-based Data Storage**  
   * **Bottleneck:** Using separate files for each job can introduce file system overhead.  
   * **Solution:** Each job has its own file, reducing the chance of conflicts and ensuring scalability.

   ---

   ### **Future Improvements** {#future-improvements}

* **Database:** For large-scale deployments, a database like MongoDB would help manage job persistence and retrieval more efficiently.  
* **Real-time Updates:** Instead of polling, we could use WebSockets or Server-Sent Events (SSE) for real-time updates.  
* **API Rate Limiting:** Rate limiting would protect the system from overload during high-traffic periods.  
  ---

  ### **Data for Pending and Completed Jobs** {#data-for-pending-and-completed-jobs}

Here is an example of what the data for a pending and completed job looks like:

**Pending Job:**

* `{`  
*   `"status": "pending",`  
*   `"creationTime": "2024-09-27T12:18:28.789Z",`  
*   `"delay": 135000`  
* `}`


**Completed Job:**

* `{`  
*   `"status": "completed",`  
*   `"result": "https://images.unsplash.com/photo-144445909471",`  
*   `"timestamp": "2024-09-27T12:20:45.068Z"`  
* `}`  
    
  ---

  ### **Screenshots** {#screenshots}

I've included screenshots of the following:

1. Coverage reports for both the frontend and backend applications.  
2. Screenshots of the frontend in its running state and showing error handling.  
   Click here to see both: [Folder](screenshoots)
   ---

   ### **Docker Setup Instructions** {#docker-setup-instructions}

You can use Docker to run both the backend and frontend services simultaneously.

**Steps to run the application with Docker:**

1. Ensure Docker and Docker Compose are installed on your system.  
2. In your project root, run the following command to build and start both services:

* `docker-compose up --build`


This command will:

* Start the backend on port **4000**.  
* Start the frontend on port **3000**.  
* Spin up any other services, like the Unsplash API service, if needed.  
4. After running the `docker-compose` command, you should be able to access the frontend by navigating to `http://localhost:3000` and the backend API at `http://localhost:4000`.  
5. To stop the containers, run:  
   `docker-compose down`  
     
   ---

   ### **Setup Instructions Without Docker** {#setup-instructions-without-docker}

If you prefer not to use Docker, follow these steps to run the application:

1. Clone the repository:  
     
* `git clone https://github.com/uzair120/fullstack-task.git`  
    
2. Install dependencies for both backend and frontend:

* `cd backend`  
* `npm install`  
* `cd ../frontend`  
* `npm install`  
    
3. Start the backend server:

* `cd be_node_jobs`  
* `npm start`  
    
4. Start the frontend server:

* `cd fe_react`  
* `npm run dev`  
    
  ---

  ### **Time Report** {#time-report}

* Understanding the Problem: 1 hour  
* Research (Unsplash API, file-based persistence): 3 hours  
* Backend Development: 4 hours  
* Frontend Development: 4 hours  
* Writing Unit Tests (Backend & Frontend): 4 hours  
* Debugging & Optimization: 2 hours  
* README Documentation: 1 hour  
  **Total: 19 hours**

