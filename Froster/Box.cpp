#include "Box.h"
#include <cstdio>  // For file input in soupReadOBJ()
#include <cstdlib> // For malloc() and free()
#include <cmath>   // For sin() and cos() in soupCreateBox()
#include <cstring> // For strcmp()

#ifndef M_PI
#define M_PI (3.141592653589793)
#endif

Box::Box()
{
	vao = 0;
	vertexbuffer = 0;
	indexbuffer = 0;
	vertexarray = NULL;
	indexarray = NULL;
	nverts = 0;
	ntris = 0;
}

Box::~Box()
{
	clean();
}

void Box::clean()
{
	if (glIsVertexArray(vao)) {
		glDeleteVertexArrays(1, &vao);
	}
	vao = 0;

	if (glIsBuffer(vertexbuffer)) {
		glDeleteBuffers(1, &vertexbuffer);
	}
	vertexbuffer = 0;

	if (glIsBuffer(indexbuffer)) {
		glDeleteBuffers(1, &indexbuffer);
	}
	indexbuffer = 0;

	if (vertexarray) {
		delete[] vertexarray;
	}
	if (indexarray) {
		delete[] indexarray;
	}
	nverts = 0;
	ntris = 0;
}

/* Create a simple box geometry */
/* TODO: Split to 24 vertices, get the normals and texcoords right. */
void Box::createBox(float xsize, float ysize, float zsize) {

	// The data array contains 8 floats per vertex:
	// coordinate xyz, normal xyz, texcoords st
	const GLfloat vertex_array_data[] = {
		-xsize, -ysize, -zsize,   -1.0f, 0.0f, 0.0f,   0.0f, 0.0f, // Vertex 0
		-xsize, -ysize, -zsize,   0.0f, -1.0f, 0.0f,   0.0f, 0.0f,
		-xsize, -ysize, -zsize,   0.0f, 0.0f, -1.0f,   0.0f, 0.0f,

		xsize, -ysize, -zsize,   1.0f, 0.0f, 0.0f,   0.0f, 0.0f, // Vertex 1
		xsize, -ysize, -zsize,   0.0f, -1.0f, 0.0f,   0.0f, 0.0f,
		xsize, -ysize, -zsize,   0.0f, 0.0f, -1.0f,   0.0f, 0.0f,

		-xsize,  ysize, -zsize,   -1.0f, 0.0f, 0.0f,   0.0f, 0.0f,  // Vertex 2
		-xsize,  ysize, -zsize,   0.0f, 1.0f, 0.0f,   0.0f, 0.0f,
		-xsize,  ysize, -zsize,   0.0f, 0.0f, -1.0f,   0.0f, 0.0f,

		xsize,  ysize, -zsize,   1.0f, 0.0f, 0.0f,   0.0f, 0.0f,  // Vertex 3
		xsize,  ysize, -zsize,   0.0f, 1.0f, 0.0f,   0.0f, 0.0f,
		xsize,  ysize, -zsize,   0.0f, 0.0f, -1.0f,   0.0f, 0.0f,

		-xsize, -ysize,  zsize,   -1.0f, 0.0f, 0.0f,   0.0f, 0.0f, // Vertex 4
		-xsize, -ysize,  zsize,   0.0f, -1.0f, 0.0f,   0.0f, 0.0f,
		-xsize, -ysize,  zsize,   0.0f, 0.0f, 1.0f,   0.0f, 0.0f,

		xsize, -ysize,  zsize,   1.0f, 0.0f, 0.0f,   0.0f, 0.0f, // Vertex 5
		xsize, -ysize,  zsize,   0.0f, -1.0f, 0.0f,   0.0f, 0.0f,
		xsize, -ysize,  zsize,   0.0f, 0.0f, 1.0f,   0.0f, 0.0f,

		-xsize,  ysize,  zsize,   -1.0f, 0.0f, 0.0f,   0.0f, 0.0f,  // Vertex 6
		-xsize,  ysize,  zsize,   0.0f, 1.0f, 0.0f,   0.0f, 0.0f,
		-xsize,  ysize,  zsize,   0.0f, 0.0f, 1.0f,   0.0f, 0.0f,

		xsize,  ysize,  zsize,   1.0f, 0.0f, 0.0f,   0.0f, 0.0f,  // Vertex 7
		xsize,  ysize,  zsize,   0.0f, 1.0f, 0.0f,   0.0f, 0.0f,
		xsize,  ysize,  zsize,   0.0f, 0.0f, 1.0f,   0.0f, 0.0f,
	};
	const GLuint index_array_data[] = {
		2,11,5,
		2,8,11, //Normal 0,0,-1

		4,13,1,
		4,16,13,//Normal 0,-1,0

		12,6,0,
		12,18,6, //Normal -1,0,0

		3,9,21,
		3,21,15, // NOrmal 1,0,0

		22,7,19,
		22,10,7, // NOrmal 0,1,0

		14,17,23,
		14,23,20 // Normal 0,0,1
	};

	nverts = 24;
	ntris = 12;

	vertexarray = new GLfloat[8 * nverts];
	indexarray = new GLuint[3 * ntris];

	for (int i = 0; i<8 * nverts; i++) {
		vertexarray[i] = vertex_array_data[i];
	}
	for (int i = 0; i<3 * ntris; i++) {
		indexarray[i] = index_array_data[i];
	}

	// Generate one vertex array object (VAO) and bind it
	glGenVertexArrays(1, &(vao));
	glBindVertexArray(vao);

	// Generate two buffer IDs
	glGenBuffers(1, &vertexbuffer);
	glGenBuffers(1, &indexbuffer);

	// Activate the vertex buffer
	glBindBuffer(GL_ARRAY_BUFFER, vertexbuffer);
	// Present our vertex coordinates to OpenGL
	glBufferData(GL_ARRAY_BUFFER,
		8 * nverts * sizeof(GLfloat), vertexarray, GL_STATIC_DRAW);
	// Specify how many attribute arrays we have in our VAO
	glEnableVertexAttribArray(0); // Vertex coordinates
	glEnableVertexAttribArray(1); // Normals
	glEnableVertexAttribArray(2); // Texture coordinates
								  // Specify how OpenGL should interpret the vertex buffer data:
								  // Attributes 0, 1, 2 (must match the lines above and the layout in the shader)
								  // Number of dimensions (3 means vec3 in the shader, 2 means vec2)
								  // Type GL_FLOAT
								  // Not normalized (GL_FALSE)
								  // Stride 8 floats (interleaved array with 8 floats per vertex)
								  // Array buffer offset 0, 3 or 6 floats (offset into first vertex)
	glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE,
		8 * sizeof(GLfloat), (void*)0); // xyz coordinates
	glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE,
		8 * sizeof(GLfloat), (void*)(3 * sizeof(GLfloat))); // normals
	glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE,
		8 * sizeof(GLfloat), (void*)(6 * sizeof(GLfloat))); // texcoords

															// Activate the index buffer
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, indexbuffer);
	// Present our vertex indices to OpenGL
	glBufferData(GL_ELEMENT_ARRAY_BUFFER,
		3 * ntris * sizeof(GLuint), indexarray, GL_STATIC_DRAW);

	// Deactivate (unbind) the VAO and the buffers again.
	// Do NOT unbind the index buffer while the VAO is still bound.
	// The index buffer is an essential part of the VAO state.
	glBindVertexArray(0);
	glBindBuffer(GL_ARRAY_BUFFER, 0);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
};


void Box::render()
{
	glBindVertexArray(vao);
	glDrawElements(GL_TRIANGLES, 3 * ntris, GL_UNSIGNED_INT, (void*)0);
	// (mode, vertex count, type, element array buffer offset)
	glBindVertexArray(0);
}
