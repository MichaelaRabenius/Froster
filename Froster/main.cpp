/*** OpenGL Includes ***/
#include <glad\glad.h>
#include <GLFW\glfw3.h>

#include "Shader.h"

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

#include <iostream>

using namespace std;
//
//Function to keep input code organized
void processInput(GLFWwindow *window);
//Adjusts the viewport if the window is resized
void framebuffer_size_callback(GLFWwindow* window, int width, int height);

// settings for window size
int SCR_WIDTH = 900;
int SCR_HEIGHT = 900;

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

double cx = -1.0, cy = -0.5, zoom = 1.0;
int itr = 200;

double last_time = 0, current_time = 0;
unsigned int ticks = 0;

bool keys[1024] = { 0 };

static void cursor_callback(GLFWwindow* window, double xpos, double ypos)
{
}

void mouse_button_callback(GLFWwindow* window, int button, int action, int mods)
{
	double xpos, ypos;
	glfwGetCursorPos(window, &xpos, &ypos);

	double xr = 2.0 * (xpos / (double)SCR_WIDTH - 0.5);
	double yr = 2.0 * (ypos / (double)SCR_WIDTH - 0.5);

	if (button == GLFW_MOUSE_BUTTON_LEFT && action == GLFW_PRESS) {
		cx += (xr - cx) / zoom / 2.0;
		cy -= (yr - cy) / zoom / 2.0;
	}
}

void scroll_callback(GLFWwindow* window, double xoffset, double yoffset)
{
	zoom += yoffset * 0.1 * zoom;
	if (zoom < 0.1) {
		zoom = 0.1;
	}
}

static void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods)
{
	const double d = 0.1 / zoom;

	if (action == GLFW_PRESS) {
		keys[key] = true;
	}
	else if (action == GLFW_RELEASE) {
		keys[key] = false;
	}

	if (keys[GLFW_KEY_ESCAPE]) {
		glfwSetWindowShouldClose(window, 1);
	}
	else if (keys[GLFW_KEY_A]) {
		cx -= d;
	}
	else if (keys[GLFW_KEY_D]) {
		cx += d;
	}
	else if (keys[GLFW_KEY_W]) {
		cy += d;
	}
	else if (keys[GLFW_KEY_S]) {
		cy -= d;
	}
	else if (keys[GLFW_KEY_MINUS] &&
		itr < std::numeric_limits <int>::max() - 10) {
		itr += 10;
	}
	else if (keys[GLFW_KEY_EQUAL]) {
		itr -= 10;
		if (itr <= 0) {
			itr = 0;
		}
	}

}

static time_t last_mtime;

static time_t get_mtime(const char *path)
{
	struct stat statbuf;
	if (stat(path, &statbuf) == -1) {
		perror(path);
		exit(1);
	}
	return statbuf.st_mtime;
}

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
		cout << "Failed to create GLFW window" << endl;
		glfwTerminate();
		return -1;
	}

	glfwSetKeyCallback(window, key_callback);
	glfwSetCursorPosCallback(window, cursor_callback);
	glfwSetMouseButtonCallback(window, mouse_button_callback);
	glfwSetScrollCallback(window, scroll_callback);
	glfwSetInputMode(window, GLFW_CURSOR_NORMAL, GLFW_STICKY_KEYS);

	glfwMakeContextCurrent(window);
	glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);

	//Initialize GLAD
	//------------------------------------------------
	//Pass the OS-specific function to load the address of OpenGL function pointers
	//Terminate if it fails
	if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
	{
		cout << "Failed to initialize GLAD" << endl;
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

	// build and compile the shader program
	// ------------------------------------
	Shader myShader("../shaders/plain.vert", "../shaders/plain.frag");

	// render loop
	// -----------
	while (!glfwWindowShouldClose(window))
	{
		// input
		// -----
		processInput(window);

		// render
		// ------

		glfwGetWindowSize(window, &SCR_WIDTH, &SCR_HEIGHT);
		glUniform2d(glGetUniformLocation(myShader.ID, "screen_size"), (double)SCR_WIDTH, (double)SCR_HEIGHT);
		glUniform1d(glGetUniformLocation(myShader.ID, "screen_ratio"), (double)SCR_WIDTH / (double)SCR_HEIGHT);
		glUniform2d(glGetUniformLocation(myShader.ID, "center"), cx, cy);
		glUniform1d(glGetUniformLocation(myShader.ID, "zoom"), zoom);
		glUniform1i(glGetUniformLocation(myShader.ID, "itr"), itr);

		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

		//send uniforms
		/*glUniform2f(glGetUniformLocation(myShader.ID, "screen_size"), (double)SCR_WIDTH, (double)SCR_HEIGHT);
		glUniform1f(glGetUniformLocation(myShader.ID, "screen_ratio"), (double)SCR_WIDTH / (double)SCR_HEIGHT);
		glUniform2f(glGetUniformLocation(myShader.ID, "center"), cx, cy);
		glUniform1f(glGetUniformLocation(myShader.ID, "zoom"), zoom);
		glUniform1i(glGetUniformLocation(myShader.ID, "itr"), itr);

		glClear(GL_COLOR_BUFFER_BIT);*/

		drawScreenQuad(myShader);


		// glfw: swap buffers and poll IO events (keys pressed/released, mouse moved etc.)
		// -------------------------------------------------------------------------------
		glfwSwapBuffers(window);
		glfwPollEvents();
	}
	//delete all allocated resources
	glfwTerminate();
	return 0;
}

//Function to keep input code organized
void processInput(GLFWwindow *window)
{
	//If the escape button is pressed, close the window
	//The WindowShouldClose property will be set to true -> rendering loop with stop
	if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
		glfwSetWindowShouldClose(window, true);
}

//Adjusts the viewport if the window is resized
void framebuffer_size_callback(GLFWwindow* window, int width, int height)
{
	glViewport(0, 0, width, height);
}