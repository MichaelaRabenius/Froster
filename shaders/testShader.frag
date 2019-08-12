#version 330 core
out vec4 FragColor;


in vec2 TexCoords;
in vec3 vTexCoord3D;

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform float u_time;

#define BackgroundColor vec4(0.223, 0.411, 0.721, 1.0)
#define LineColor vec4(1.0, 1.0, 1.0, 1.0)

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
    
    return vec4(LineColor.rgb, 1.-smoothstep(-w, w, d));
}

// vec4 drawline(vec2 start, float l, float angle, vec2 p1, float width) {


//     float d = line(p, p0, p1, width);
//     //d += noise2d(p * vec2(0.2)) * 0.005;
//     float w = fwidth(d) * 1.0;
    
//     return vec4(LineColor.rgb, 1.-smoothstep(-w, w, d));
// }


void main()
{

	vec2 uv = TexCoords;

    vec4 fragColor = BackgroundColor;

    // Draw line
    vec2 linePos = uv;
    vec2 start = vec2(0.5, 0.2);
    vec2 end = vec2(0.5, 0.3);

    vec4 line = drawline(linePos, 
                         start, 
                         end, 0.005);

    vec4 line2 = drawline(linePos, end, end + vec2(0.1), 0.005);
    

    vec4 c = vec4(0);
    c.rgb = mix(line.rgb, c.rgb, c.a);
    c.a = max(line.a, c.a);

    c.rgb = mix(line2.rgb, c.rgb, c.a);
    c.a = max(line2.a, c.a);

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
