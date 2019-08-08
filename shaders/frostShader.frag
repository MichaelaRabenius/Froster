#version 410
out vec4 colorOut;

in vec2 texCoord;
in vec3 interpolatedNormal;
in vec3 lightDirection;

uniform float t;
uniform vec3 viewDirection;

void main()
{
    //Compute the base color for the object
    vec3 baseColor = vec3(0.223, 0.411, 0.721); //Greyish blue
    //Psychic pattern
    // float a = sin(texCoord.s * 30.0 + t)/2.0 + 0.5;
	// float b = sin(texCoord.t * 30.0 * (1.0+sin(t/4.0)))/2.0 + 0.5;
	// vec3 psychColor = vec3(a, b, 0.8); // inColor;

    // Add Phong Lighting
    vec3 L = normalize(lightDirection);
    vec3 V = normalize(viewDirection);//vec3(0.0, 0.0, 1.0);
    vec3 N = interpolatedNormal;
    vec3 R = 2.0 * dot(N,L) * N - L;
    float alpha = 20;
    vec3 ka = vec3(0.3, 0.3, 0.3) * baseColor;
    vec3 Ia = vec3(0.8, 0.8, 0.8);
    vec3 kd = baseColor;//vec3(0.7, 0.4, 0.0);
    vec3 Id = vec3(0.7, 0.7, 0.7);
    vec3 ks = vec3(1.0, 1.0, 1.0);
    vec3 Is = vec3(1.0, 1.0, 1.0);

    float dotNL = max(dot(N,L), 0.0);
    float dotRV = max(dot(R,V), 0.0);

    if (dotNL == 0.0) dotRV = 0.0;

    vec3 shadedcolor = Ia*ka + Id*kd*dotNL + Is*ks*pow(dotRV, alpha);

    colorOut = vec4(shadedcolor, 1.0);


}