#version 330 core
out vec4 FragColor;


in vec2 TexCoords;
in vec3 vTexCoord3D;

uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159

float rand(float x)
{
    return fract(sin(dot(vec2(x+47.49,38.2467/(x+2.3)), vec2(12.9898, 78.233)))* (43758.5453));
}

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}


mat3 Rotate(float angle){
    float c = cos(angle * PI / 180);
    float s = sin(angle * PI / 180);
    
    return  mat3(
            vec3(c, s, 0),
            vec3(-s, c, 0),
            vec3(0, 0, 1)
    ); 
}

mat3 Translate(vec2 displacement){
    return  mat3(
        vec3(1, 0, 0),
        vec3(0, 1, 0),
        vec3(displacement , 1)
    ); 
}

mat3 Rot (float angle)
{
    float c = cos(angle);
    float s = sin(angle);
    
return  mat3(
        vec3(c, s, 0),
        vec3(-s, c, 0),
        vec3(0, 0, 1)
); 
}

mat3 Disp (vec2 displacement)
{
return  mat3(
        vec3(1, 0, 0),
        vec3(0, 1, 0),
        vec3(displacement, 1)
); 
}

float sdCappedCylinder( vec2 p, vec2 h )
{
  p -= vec2(0.,h.y);
  vec2 d = abs(vec2(length(p.x),p.y)) - h;
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

// Primitive shape for the right l-system.
float right_p(vec2 pt, float wid, float len)
{
    mat3 posR = Rot(-(22.5/360.)*2.*PI);
    
    float t1 = sdCappedCylinder(pt, vec2(wid,len));
    vec2 pt_t2 = (posR*Disp(vec2(0,-2.*len))* vec3(pt,1)).xy;
    float t2= sdCappedCylinder(pt_t2, vec2(wid,len/2.));
    return min(t1, t2);
}

float right(vec2 pt)
{
    mat3 posR = Rot(-(22.5/360.)*2.*PI);
    mat3 negR = Rot(22.5/360.*2.*PI);
    
    const int depth = 1;
    const int branches = 4; 
    int maxDepth = int(pow(float(branches) , float(depth )));
    float len = 1.3;
    float wid = .01;
    pt = pt + vec2(0,2);  
    mat3 m1 = posR*Disp(vec2(0,-len));
    
    float trunk = right_p(pt, wid, len);
    float d = 500.;
    
    int c = 0; // Running count for optimizations
    for (int count = 0; count <= 110; ++count){
    
    int off = int(pow(float(branches), float(depth)));
    vec2 pt_n = pt;
                
      for (int i = 1; i <= depth; ++i)
      {
        float l = len/pow(2.,float(i));
        
        off /= branches; 
        int dec = c / off;
        int path = dec - branches*(dec/branches); //  dec % kBranches
          
        mat3 mx;
	    if(path == 0){
		  mx = negR*Disp(vec2(0,-2.*l));
	    }
        else if(path == 1){
		  mx = negR*Disp(vec2(0,-4.*l));
	    }
        else if(path == 2){
          // This branch overlaps the first, so you don't
          // immediately see its effects.
          mx = Disp(vec2(0,-2.*l));
	    }  
	    else if(path == 3){
          mx = Disp(vec2(0,-2.*l))*posR*Disp(vec2(0,-4.*l));
	    }

         pt_n = (mx* vec3(pt_n,1)).xy; 
         float y = right_p(pt_n, wid, l); 
          
        // Early bail out. Bounding volume is a noodle of radius
        // 2. * l around line segment.
        if( y-3.0*l > 0.0 ) { c += off-1; break; }
          d = min( d, y );
     }
        
    ++c;
    if (c > maxDepth) break;
    }
   return min(d,trunk);
}

void main(){
    vec2 st = TexCoords*2 - 1;
    st *= 10;
    float len = 0.5;

    float c = right(st);

    float t = clamp(c, 0.0, .04) * 2.*12.5;
    vec4 bg = vec4(0.223, 0.411, 0.721, 1.0);
    vec4 fg = vec4(.8);
    vec4 Color = mix(bg, fg, 1.-t);

    vec3 color = vec3(c,c,c);
    FragColor = Color;
}