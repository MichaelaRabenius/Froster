#version 330 core
out vec4 FragColor;


in vec2 TexCoords;
in vec3 vTexCoord3D;

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform float u_time;


#define amplitude 0.1
#define BackgroundColor vec4(0.957, 0.925, 0.773, 1.0)
#define EdgeColor vec4(0.2, 0.2, 0.2, 1.0)
#define BlueColor vec4(0.384, 0.667, 0.655, 1.0)
#define PurpleColor vec4(0.761, 0.706, 0.835, 1.0)
#define YellowColor vec4(0.961, 0.753, 0.196, 1.0)
#define GreenColor vec4(0.624, 0.796, 0.361, 1.0)
#define OrangeColor vec4(0.953, 0.482, 0.318, 1.0)
#define RedColor vec4(0.886, 0.557, 0.616, 1.0)

// float noise2d(vec2 p) {
// 	float t = texture(iChannel0, p).x;
// 	t += 0.5 * texture(iChannel0, p * 2.0).x;
// 	t += 0.25 * texture(iChannel0, p * 4.0).x;
// 	return t / 1.75;
// }

float line(vec2 p, vec2 p0, vec2 p1, float width) {
    vec2 dir0 = p1 - p0;
    vec2 dir1 = p - p0;
    float h = clamp(dot(dir1, dir0)/dot(dir0, dir0), 0.0, 1.0);
    float d = (length(dir1 - dir0 * h) - width * 0.5);
    return d;
}

vec4 drawline(vec2 p, vec2 p0, vec2 p1, float width) {   		
    float d = line(p, p0, p1, width);
    //d += noise2d(p * vec2(0.2)) * 0.005;
    float w = fwidth(d) * 1.0;
    
    return vec4(EdgeColor.rgb, 1.-smoothstep(-w, w, d));
}

void main()
{

	vec2 uv = TexCoords;

    vec4 fragColor = BackgroundColor;

    // Draw line
    vec2 linePos = uv;
    vec2 start = vec2(0.2);
    vec2 end = vec2(0.8);

    vec4 line = drawline(linePos, 
                         start, 
                         end, 0.015);
    

    vec4 c = vec4(0);
    c.rgb = mix(line.rgb, c.rgb, c.a);
    c.a = max(line.a, c.a);

    fragColor.rgb = mix(fragColor.rgb, c.rgb, c.a);

    FragColor = fragColor;
}





/*
void main(){
    vec2 st = TexCoords;
    st.xy -= vec2(0.5); // Set texture coordinates to [-0.5, 0.5]
    vec3 color = vec3(0.0);

    float angle = atan(st.y, st.x);
    float radius = sqrt(st.x*st.x + st.y*st.y);
    float radialIntensity = pow(sin(radius * 32.0) * 0.5 + 0.5, 2.0);
    float angleIntensity = pow(sin(angle * 32.0) * 0.5 + 0.5, 2.0);
    float intensity = radialIntensity * angleIntensity;

    color = vec3(intensity);

    FragColor = vec4(color, 1.0);
}
*/
