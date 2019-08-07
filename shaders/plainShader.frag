#version 410
out vec4 colorOut;

in vec2 texCoord;
in vec3 interpolatedNormal;
in vec3 lightDirection;

uniform float t;

void main()
{
    //Psychic pattern
    float a = sin(texCoord.s * 30.0 + t)/2.0 + 0.5;
	float b = sin(texCoord.t * 30.0 * (1.0+sin(t/4.0)))/2.0 + 0.5;
	colorOut = vec4(a, b, 0.8, 1.0); // inColor;
}