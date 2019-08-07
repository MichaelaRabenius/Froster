/*** OpenGL Includes ***/
#include <glad\glad.h>
#include <GLFW\glfw3.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

#include <iostream>

#include "Shader.h"
#include "Sphere.h"

/*************************** WINDOW SETTINGS **********************************/
//Function to keep input code organized
void processInput(GLFWwindow *window);
//Adjusts the viewport if the window is resized
void framebuffer_size_callback(GLFWwindow* window, int width, int height);

// settings for window size
int SCR_WIDTH = 900;
int SCR_HEIGHT = 900;

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

float radius = 0.3f;
Sphere ball;

/*************************** SHADERS *********************************/
Shader plainShader, ballShader;


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
	plainShader.init("../shaders/plainShader.vert", "../shaders/plainShader.frag");

	
	//Create sphere
	ball.createSphere(radius, 20);

	// render loop
	// -----------
	while (!glfwWindowShouldClose(window))
	{
		// input
		// -----
		processInput(window);

		// render
		// ------
		glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
		glfwGetWindowSize(window, &SCR_WIDTH, &SCR_HEIGHT);
		glUniform2d(glGetUniformLocation(plainShader.ID, "screen_size"), (double)SCR_WIDTH, (double)SCR_HEIGHT);
		glUniform1d(glGetUniformLocation(plainShader.ID, "screen_ratio"), (double)SCR_WIDTH / (double)SCR_HEIGHT);

		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);


		//drawScreenQuad(plainShader);
		plainShader.use();
		ball.render();


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