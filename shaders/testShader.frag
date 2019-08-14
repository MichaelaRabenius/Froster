#version 330 core
out vec4 FragColor;


in vec2 TexCoords;
in vec3 vTexCoord3D;

uniform vec2 u_resolution;
uniform float u_time;

#define BackgroundColor vec4(0.223, 0.411, 0.721, 1.0)
#define LineColor vec4(1.0, 1.0, 1.0, 1.0)

#define PI 3.14159

#define kDepth 2
#define kBranches 2
#define kMaxDepth 8 // branches ^ depth

// Functions for the lindenmayer system
//Returns rotation matrix around the z-axis
mat3 Rotation (float angle)
{
    //Convert degree angle to radians
    float c = cos(angle * (PI/180));
    float s = sin(angle * (PI/180));
    
    return  mat3(vec3(c, s, 0),
                vec3(-s, c, 0),
                vec3(0, 0, 1)); 
}

//Returns a translation matrix
mat3 Displace (vec2 displacement)
{   
    //Note: the matrix is transposed since OpenGL uses column-major matrix ordering
    //instead of row-major ordering which is used in textbooks etc.
    return  mat3(vec3(1, 0, 0),
                vec3(0, 1, 0),
                vec3(displacement, 1)); 
}

//Returns a translation matrix
mat3 Displace2 (vec2 point, vec2 displacement)
{   
    //Move the point to origin
    mat3 m1 = mat3(vec3(1, 0, 0),
                vec3(0, 1, 0),
                vec3(-point, 1));
    
    mat3 m2 = mat3(vec3(1, 0, 0),
                vec3(0, 1, 0),
                vec3(displacement, 1));
    //Note: the matrix is transposed since OpenGL uses column-major matrix ordering
    //instead of row-major ordering which is used in textbooks etc.
    return  m2*m1;
}

//Returns a float determining if a point is on a line segment. The float can then be used to draw
float Line(vec2 test_pt, vec2 start_pt, vec2 end_pt, float thickness){

    vec2 pa = test_pt - start_pt; //Vector between the start of the line and the test point
    vec2 ba = end_pt - start_pt; //Vector between the start and end of the line segment.
    
    //Calculate the projection of the point on the line(normalized based on the length of the line segment),
    // to determine if the test point is on the line segment.
    float proj = dot(pa,ba)/dot(ba,ba);

    float h = clamp( proj, 0.0, 1.0 ); //The projection will always be between the start and end points

    float dist = length(pa - ba*h); //Calculate minimum distance between the test point and the line

    //Compare the distance of the test point to the thickness of the line. If the point is within the thickness
    //area, the point is on the line and should be colored.
    return smoothstep(0.0, thickness, dist);
}

vec2 ComputeNewEnd(vec2 start_pt, float len, float angle){
    vec2 end_pt = start_pt + vec2(len, 0.0);

    //Create rotation matrix
    mat3 rot = Rotation(angle);
    
    //Translate the new end poin tback to origin to rotate it angle degrees.
    mat3 m = Displace(start_pt) * rot * Displace(-start_pt);

    end_pt = (m * vec3(end_pt , 1)).xy;
    return end_pt;
}

mat3 matRotate(float angle)
{
    float c = cos(angle);
    float s = sin(angle);
    return mat3( c, s, 0, -s, c, 0, 0, 0, 1);
}

//Function for drawing a line based on a starting point, length and angle.
//Returns a vec3 containing a float used to draw the line, as well as the generated end position of the 
//line segment, which can then be used to draw other lines
vec3 draw_line(vec2 test_pt, vec2 start_pt, float len, float width, float angle ){
    //Calculate the end point based on the length and angle
    vec2 end_pt = ComputeNewEnd(start_pt, len, angle);

    float line = Line(test_pt, start_pt, end_pt, width);

    return vec3(end_pt, line);
}

float lsystem(vec2 test_pt, vec2 start_pt){

    float len = 0.5;
    float width = .01;
    float angle = 90.0;


    vec3 trunk = draw_line(test_pt, start_pt, len, width, angle);
    start_pt = trunk.xy;
    float d = trunk.z;



    int c = 0;
    for( int count=0; count < kMaxDepth; count++ )
    {
        int off = kMaxDepth;
    	vec2 pt_n = test_pt;
        
        float l = len;
        float w = width;
        
      	for( int i=1; i<=kDepth; i++ )
      	{
            off /= kBranches; 
            int dec = c / off;
        	int path = dec - kBranches*(dec/kBranches); //  dec % kBranches
          
            mat3 mx;
	    	if( path == 0 )
           	{
		  		mx = matRotate(0.35) * Displace( vec2(0.0,0.4*l));
	    	}
        	else if( path == 1 )
            {
          		mx = matRotate(-0.6) * Displace(vec2(0.0,0.6*l));
	    	}
	    	else
            {
          		mx = matRotate(0.23) * Displace(vec2(0.0,1.0*l));
	    	}
            
            pt_n = (mx * vec3(pt_n,1)).xy;

            vec3 s = draw_line(pt_n, start_pt, len, width, angle);
            
            d = min( d, s.z );
     	}
        
    	c++;
    	if( c > kMaxDepth ) break;
	}
    

    return d;
}


float sdBranch( vec2 p, float w1, float l )
{
    float h = clamp( -p.y/l, 0.0, 1.0 );
	float d = length( p - vec2(0.0,l*h) );
    return d - mix( w1, w1, h );
}

void main(){
    //NOTE: This position will be the pixel position to evaluate to determine which color the pixel should have
    //I.e. for every pixel position should determine if the pixel should be black or white.
    //This means we can check how far the point is from the line.
    //if its far away it should be black, but if it is on the line it should be white
    vec2 position = TexCoords; 
    position = position * 2 -1;

    vec2 start = vec2(0.0, -0.3);


    // mat3 mx = Rotation(90 + sin(u_time+1.)) * Displace(vec2(0.0,0.0));

    // position = (mx * vec3(position,1)).xy;

    // float color = sdBranch(position, 0.001, 0.5);
   
    

    float color = lsystem(position, start);
    //determine if the position point is on a line between start and end
    //float line1 = Line(position, start, end);


    // mat3 m = Displace(end); 

    // //Translate the starting point to the end point of last segment.
    // vec2 new_start = (m*vec3(start, 1)).xy; 
    // //Comput the new end point
    // vec2 new_end = ComputeNewEnd(new_start, len*2, 35.0);
    // float line2 = Line(position, new_start, new_end);

    // new_start = new_end;
    // new_end = ComputeNewEnd(new_start, len, 180.0);
    // float line3 = Line(position, new_start, new_end);

    // float c = line1 * line2 * line3;

    // vec3 color = vec3(c, c, c);

    FragColor = vec4(color, color, color, 1.0);
}



// float line(vec2 p, vec2 p0, vec2 p1, float width) {
//     vec2 dir0 = p1 - p0;
//     vec2 dir1 = p - p0;
//     float h = clamp(dot(dir1, dir0)/dot(dir0, dir0), 0.0, 1.0);
//     float d = (length(dir1 - dir0 * h) - width * 0.5);
//     return d;
// }

// vec4 drawline(vec2 p, vec2 p0, vec2 p1, float width) {   		
//     float d = line(p, p0, p1, width);
//     //d += noise2d(p * vec2(0.2)) * 0.005;
//     float w = fwidth(d) * 1.0;
    
//     return vec4(LineColor.rgb, 1.-smoothstep(-w, w, d));
// }



// // Draw a line with a specific length and  angle
// vec4 drawline(vec2 p, vec2 start_pt, float len, float width, float angle) { 

//     // I need to calculate where the end point will be
//     // Assume we start with a simple straight line point in positive x-direction
//     vec2 end_pt = start_pt + vec2(len, 0.0);

//     //Create rotation matrix
//     mat3 rot = Rotation(angle);
    
//     //Translate the new end poin tback to origin to rotate it angle degrees.
//     mat3 m = rot * Displace(end_pt);

//     end_pt = (m * vec3(end_pt , 1)).xy;


//     //end  = displacement2*rot*displacement1*end;

//     float d = line(p, start_pt, end_pt, width);
//     //d += noise2d(p * vec2(0.2)) * 0.005;
//     float w = fwidth(d) * 1.0;
    
//     return vec4(LineColor.rgb, 1.-smoothstep(-w, w, d));
// }




// void main()
// {
// 	vec2 uv = TexCoords;
//     uv = uv*2.-1.; // Set coordinates to range [-1, 1] with origin in the middle of the window.

//     vec4 fragColor = BackgroundColor;

//     float line_length = 0.1;
//     float line_width = 0.01;
//     float angle = 90.0; // Need to convert to radians?

//     //Draw line
//     vec2 linePos = uv;
//     vec2 start_pt = vec2(0.0, 0.0);

//     vec4 base_line = drawline(linePos, start_pt, line_length, line_width, 90.0);
//     vec4 bg = vec4(0);
//     bg.rgb = mix(base_line.rgb, bg.rgb, bg.a);
//     bg.a = max(base_line.a, bg.a);

//     //This should displace a point a a line length along the y-axis
//     mat3 m = Displace(vec2(0, 2 * line_length));



//     //vec4 line = drawline(linePos, start_pt, end_pt, line_width);
   
//     // Mix the line to get a color texture of it
//     // vec4 bg = vec4(0);
//     // bg.rgb = mix(line.rgb, bg.rgb, bg.a);
//     // bg.a = max(line.a, bg.a);

//     //This should move the starting point 1 length upwards.
//     vec2 start_pt2 = (m * vec3(start_pt, 1.0)).xy;

//     // start_pt = end_pt;
//     vec4 line2 = drawline(linePos, start_pt2, line_length, line_width, angle);
   
//     // Mix the line to get a color texture of it
//     bg.rgb = mix(line2.rgb, bg.rgb, bg.a);
//     bg.a = max(line2.a, bg.a);

    


//     fragColor.rgb = mix(fragColor.rgb, bg.rgb, bg.a);

//     FragColor = fragColor;
// }



