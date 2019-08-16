#include <glad\glad.h>
#include <GLFW\glfw3.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

#include <iostream>

#include "Shader.h"
#include "Sphere.h"
#include "Box.h"
#include "Camera.h"

/*************************** WINDOW SETTINGS **********************************/
//Function to keep input code organized
void processInput(GLFWwindow *window);
//Adjusts the viewport if the window is resized
void framebuffer_size_callback(GLFWwindow* window, int width, int height);

// settings for window size
int SCR_WIDTH = 900;
int SCR_HEIGHT = 900;

Camera camera(glm::vec3(0.0f, 0.0f, 2.0f));
float lastX = SCR_WIDTH / 2.0f;
float lastY = SCR_HEIGHT / 2.0f;
bool firstMouse = true;

// world rotation
glm::mat4 rot(1.0);

// timing
float deltaTime = 0.0f;	// time between current frame and last frame
float lastFrame = 0.0f;

/**************************** OBJECTS *********************************/
//quad
float quadVertices[] = { // vertex attributes for a quad that fills the entire screen in Normalized Device Coordinates.
						 // positions   // texCoords
	-1.0f,  1.0f,  0.0f, 1.0f,
	-1.0f, -1.0f,  0.0f, 0.0f,
	1.0f, -1.0f,  1.0f, 0.0f,

	-1.0f,  1.0f,  0.0f, 1.0f,
	1.0f, -1.0f,  1.0f, 0.0f,
	1.0f,  1.0f,  1.0f, 1.0f
};
GLuint quadVAO;

// Draw to quad covering the screen
void drawScreenQuad(Shader shader) {
	shader.use();
	glBindVertexArray(quadVAO);
	glDrawArrays(GL_TRIANGLES, 0, 6);
}

float radius = 0.5f;
Sphere ball;
Box box;

/*************************** SHADERS *********************************/
Shader frostShader, testShader, spotShader;


/***** Function Declarations *****/
GLuint generateTextureFromData(GLfloat * data);
void drawScreenQuad(Shader shader);
void framebuffer_size_callback(GLFWwindow* window, int width, int height);
void mouse_callback(GLFWwindow* window, double xpos, double ypos);
void scroll_callback(GLFWwindow* window, double xoffset, double yoffset);
void processInput(GLFWwindow *window);

int main() {
	//Initialize GLFW for window handling
	//-----------------------------------
	glfwInit();
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 1);
	glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

	//Create glfw window
	GLFWwindow* window = glfwCreateWindow(SCR_WIDTH, SCR_HEIGHT, "Froster", NULL, NULL);
	if (window == NULL)
	{
		std::cout << "Failed to create GLFW window" << std::endl;
		glfwTerminate();
		return -1;
	}

	glfwSetInputMode(window, GLFW_CURSOR_NORMAL, GLFW_STICKY_KEYS);

	glfwMakeContextCurrent(window);
	glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);

	//Initialize GLAD
	//------------------------------------------------
	//Pass the OS-specific function to load the address of OpenGL function pointers
	//Terminate if it fails
	if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
	{
		std::cout << "Failed to initialize GLAD" << std::endl;
		return -1;
	}


	/********** set up screen quad **********/
	// screen quad VAO
	GLuint quadVBO;
	glGenVertexArrays(1, &quadVAO);
	glGenBuffers(1, &quadVBO);
	glBindVertexArray(quadVAO);
	glBindBuffer(GL_ARRAY_BUFFER, quadVBO);
	glBufferData(GL_ARRAY_BUFFER, sizeof(quadVertices), &quadVertices, GL_STATIC_DRAW);
	glEnableVertexAttribArray(0);
	glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)0);
	glEnableVertexAttribArray(1);
	glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)(2 * sizeof(float)));

	// build and compile the shader programs
	// ------------------------------------
	frostShader.init("../shaders/frostShader.vert", "../shaders/frostShader.frag");
	testShader.init("../shaders/testShader.vert", "../shaders/testShader.frag");
	spotShader.init("../shaders/spots.vert", "../shaders/spots.frag");

	float u_time = 0;
	
	//Create sphere
	ball.createSphere(radius, 20);
	box.createBox(0.5f, 0.5f, 0.5f);

	//glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);
	glEnable(GL_CULL_FACE);
	// render loop
	// -----------
	while (!glfwWindowShouldClose(window))
	{
		// input
		// -----
		// per-frame time logic
		float currentFrame = glfwGetTime();
		deltaTime = currentFrame - lastFrame;
		lastFrame = currentFrame;
		u_time += deltaTime;

		// input
		processInput(window);

		// render
		// ------
		glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
		glfwGetWindowSize(window, &SCR_WIDTH, &SCR_HEIGHT);
		glUniform2d(glGetUniformLocation(frostShader.ID, "screen_size"), (double)SCR_WIDTH, (double)SCR_HEIGHT);
		glUniform1d(glGetUniformLocation(frostShader.ID, "screen_ratio"), (double)SCR_WIDTH / (double)SCR_HEIGHT);

		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);


		GLfloat t = 1;
		glUniform1f(glGetUniformLocation(frostShader.ID, "t"), t);

		//Send the cameras view direction to the fragment shader in order to calculate lighting
		glUniform3fv(glGetUniformLocation(frostShader.ID, "viewDirection"), 1, glm::value_ptr(camera.Front));


		// Create projection and view matrix to send to shader
		glm::mat4 projection = glm::perspective(glm::radians(camera.Zoom), (float)SCR_WIDTH / (float)SCR_HEIGHT, 0.1f, 100.0f);
		glm::mat4 view = camera.GetViewMatrix(); // camera/view transformation
		glm::mat4 model(1.0f);
		model = model * rot;
		
		//frostShader.use();
		//// pass projection matrix to the sphere shader
		//frostShader.setMat4("model", model);
		//frostShader.setMat4("projection", projection);
		//frostShader.setMat4("view", view);


		glUniform1f(glGetUniformLocation(testShader.ID, "u_time"), u_time);
		glUniform2fv(glGetUniformLocation(testShader.ID, "u_resolution"), 1, glm::value_ptr(glm::vec2(SCR_WIDTH, SCR_HEIGHT)));
		testShader.use();
		// pass projection matrix to the sphere shader
		testShader.setMat4("model", model);
		testShader.setMat4("projection", projection);
		testShader.setMat4("view", view);

		/*spotShader.use();
		spotShader.setMat4("model", model);
		spotShader.setMat4("projection", projection);
		spotShader.setMat4("view", view);*/

		drawScreenQuad(testShader);
		//ball.render();
		//box.render();

		// glfw: swap buffers and poll IO events (keys pressed/released, mouse moved etc.)
		// -------------------------------------------------------------------------------
		glfwSwapBuffers(window);
		glfwPollEvents();
	}
	//delete all allocated resources
	glfwTerminate();
	return 0;
}
//Update world rotation matrix
void updateRot(int dir, int axis) {
	float timer = deltaTime * dir;

	if(axis == 0)
		rot = glm::rotate(rot, glm::radians(timer * 100), glm::vec3(1.0f, 0.0f, 0.0f));
	else if(axis == 1)
		rot = glm::rotate(rot, glm::radians(timer * 100), glm::vec3(0.0f, 1.0f, 0.0f));
	else if (axis == 2)
		rot = glm::rotate(rot, glm::radians(timer * 100), glm::vec3(0.0f, 0.0f, 1.0f));

}

// Process input from keyboard
void processInput(GLFWwindow *window)
{
	if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
		glfwSetWindowShouldClose(window, true);
	if (glfwGetKey(window, GLFW_KEY_W) == GLFW_PRESS)
		camera.ProcessKeyboard(FORWARD, deltaTime);
	if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS)
		camera.ProcessKeyboard(BACKWARD, deltaTime);
	if (glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS)
		camera.ProcessKeyboard(LEFT, deltaTime);
	if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS)
		camera.ProcessKeyboard(RIGHT, deltaTime);
	if (glfwGetKey(window, GLFW_KEY_UP) == GLFW_PRESS)
		updateRot(-1, 0);
	if (glfwGetKey(window, GLFW_KEY_DOWN) == GLFW_PRESS)
		updateRot(1, 0);
	if (glfwGetKey(window, GLFW_KEY_LEFT) == GLFW_PRESS)
		updateRot(-1, 1);
	if (glfwGetKey(window, GLFW_KEY_RIGHT) == GLFW_PRESS)
		updateRot(1, 1);
}

// glfw: whenever the window size changed (by OS or user resize) this callback function executes
// ---------------------------------------------------------------------------------------------
void framebuffer_size_callback(GLFWwindow* window, int width, int height)
{
	// make sure the viewport matches the new window dimensions; note that width and 
	// height will be significantly larger than specified on retina displays.
	glViewport(0, 0, width, height);
}

// glfw: whenever the mouse moves, this callback is called
void mouse_callback(GLFWwindow* window, double xpos, double ypos)
{
	if (firstMouse)
	{
		lastX = xpos;
		lastY = ypos;
		firstMouse = false;
	}

	float xoffset = xpos - lastX;
	float yoffset = lastY - ypos; // reversed since y-coordinates go from bottom to top

	lastX = xpos;
	lastY = ypos;

	camera.ProcessMouseMovement(xoffset, yoffset);
}

// glfw: whenever the mouse scroll wheel scrolls, this callback is called
void scroll_callback(GLFWwindow* window, double xoffset, double yoffset)
{
	camera.ProcessMouseScroll(yoffset);
}