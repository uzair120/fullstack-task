# **Fullstack Job Execution Task**

## **Problem Statement**

We need to build a Full Stack job execution system with the following key functionalities:

1. **Backend**:  
   * `POST /jobs`: Creates a new job, returning its ID.  
   * `GET /jobs`: Fetches a list of all jobs. Resolved jobs return the job result; unresolved jobs return their status.  
   * `GET /jobs/{jobId}`: Returns the result or status of a specific job.  
   * **Job Definition**: Each job retrieves a random Unsplash food image. The execution is delayed (5 sec to 5 min, in 5 sec steps).  
2. **Frontend**:  
   * Display a list of jobs and their statuses or results.  
   * Create new jobs.  
   * Fetch and display job results once resolved.  
3. **Challenges to Consider**:  
   * **High Load**: Handle more than one pending job at a time.  
   * **Unstable Internet**: Handle intermittent connectivity between the client and backend.  
   * **Persistence**: Job results must be saved for future retrieval.

   I choose docker for running frontend and backend instances with \`docker-compose\`. Also, I will be using disk for saving data files using docker disk management. 

## **Solution Design**

### **Backend**

* **Framework**: I’ve used Node.js with Express.js to build the API.  
* **Data Storage**: I chose a file-based approach, adhering to the requirement to avoid a database. The design needs to handle multiple requests without conflicts.

### **Key Components**

#### **1\. Job Management**

Each job retrieves a random Unsplash food image. The execution is delayed to simulate a real-world job queue, where job completion can take anywhere from 5 seconds to 5 minutes.

* **File Structure**:  
  * Each job is saved in a separate file, named as `jobId_status.json`.  
  * Upon job completion, the status of the job changes from `pending` to `completed`  or `error`, and or the file is renamed accordingly to include the final result.  
* **Why This Approach?**  
  * **Scalability**: By isolating each job’s status and result into separate files, we avoid bottlenecks that could arise from reading/writing a single file under high traffic.  
  * **Lock-free Operations**: As each job is handled in its own file, there’s no risk of deadlocks caused by simultaneous read/write operations on the same resource.  
  * **Simplicity**: The logic remains simple enough to meet the requirement of using files instead of databases while being scalable for a moderate load.

#### **2\. Handling High Load**

To manage multiple job requests simultaneously:

* I implemented **asynchronous programming** to handle I/O-bound tasks (file reads/writes, Unsplash API calls). This allows the system to process multiple jobs concurrently without blocking the main event loop.  
* For potential **CPU-intensive tasks**, worker threads can be introduced, but for this task, async promises suffice.

#### **3\. Job Status Handling**

When a job is requested, its current status is returned until the job is resolved.

* Each file representing a job is periodically updated, and the client will periodically poll the backend to check for updates.

**Why This Approach?**

* **Efficiency**: Using a polling mechanism lets the client know when a job is resolved without requiring a complex real-time solution.  
* **File-based Persistence**: Even if the system goes down, the results are saved in files, making them available upon restart.

#### **4\. Unsplash API Integration**

For this task, I am utilizing the [**Unsplash JavaScript wrapper**](https://github.com/unsplash/unsplash-js) to interact with the Unsplash API, which simplifies the API interaction by providing an easy-to-use library.

* **Wrapper**: The `unsplash-js` library allows us to make API calls without needing to manually construct URLs, abstracting much of the complexity.  
* **Job Definition**: Each job fetches **one random image** from the food category using this wrapper. The result for each job will be a unique image URL.

### **Frontend**

* **Framework**: I opted for React, leveraging its component-driven architecture to manage the job creation and status/result display.  
* **Job List**: The frontend polls the `/jobs` endpoint to fetch and display all jobs. Pending jobs show their status, and resolved jobs display the Unsplash image.  
* **Create New Job**: A form allows users to create a new job. This triggers a `POST /jobs` request, creating a job in the backend.  
* **Real-time Updates**: The frontend polls the backend at regular intervals to check the job’s progress. Once resolved, the image is displayed.

### **Bottlenecks & Mitigations**

#### **1\. High Load**

* **Bottleneck**: Under high load, multiple jobs being processed simultaneously can lead to slow I/O operations.  
* **Solution**: Using **asynchronous programming** (Promises) ensures that the system remains responsive even when handling multiple jobs. For extreme loads, we can consider adding API throttling or worker threads to handle CPU-intensive tasks.

#### **2\. Unstable Internet Connection**

* **Bottleneck**: A spotty internet connection between the client and the backend can lead to incomplete or failed job creation and result retrieval.  
* **Solution**: The client implements retries on failed requests, and jobs are persisted in the backend so they can be retrieved later.

#### **3\. File-based Data Storage**

* **Bottleneck**: Using separate files for each job status introduces the risk of file system overhead and potential read/write conflicts.  
* **Solution**: Each job has its own file, allowing for independent handling. This minimizes conflicts and ensures that the system remains scalable without a central database.

### **Future Improvements**

* **Database**: For larger-scale implementations, a database like MongoDB or SQLite would help better manage job persistence and retrieval.  
* **Real-time Updates**: Instead of polling, we could use WebSockets or Server-Sent Events (SSE) for real-time job status updates.  
* **API Rate Limiting**: Adding rate limiting would protect the system from overload during high traffic periods.
