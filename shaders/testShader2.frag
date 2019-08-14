#version 330 core
out vec4 FragColor;


in vec2 TexCoords;
in vec3 vTexCoord3D;

uniform vec2 u_resolution;
uniform float u_time;

#define BackgroundColor vec4(0.223, 0.411, 0.721, 1.0)
#define LineColor vec4(1.0, 1.0, 1.0, 1.0)

#define PI 3.14159



#define kDepth 7
#define kBranches 3
#define kMaxDepth 2187 // branches ^ depth

//--------------------------------------------------------------------------

mat3 matRotate(float angle)
{
    float c = cos(angle);
    float s = sin(angle);
    return mat3( c, s, 0, -s, c, 0, 0, 0, 1);
}

mat3 matTranslate( float x, float y )
{
    return mat3( 1, 0, 0, 0, 1, 0, -x, -y, 1 );
}

float sdBranch( vec2 p, float w1, float w2, float l )
{
    float h = clamp( p.y/l, 0.0, 1.0 );
	float d = length( p - vec2(0.0,l*h) );
    return d - mix( w1, w2, h );
}

//Returns a float determining if a point is on a line segment. The float can then be used to draw
float Line(vec2 test_pt, vec2 start_pt, vec2 end_pt){

    float thickness = 0.5;

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


//--------------------------------------------------------------------------

float map( vec2 pos )
{
    const float len = 3.2;
    const float wid = 0.3;
    const float lenf = 0.6;
    const float widf = 0.4;
    
    float d = sdBranch( pos, wid, wid, len );
    //float d = Line( pos, vec2(0.0), vec2(0.0, 3));
    
    
    int c = 0;
    for( int count=0; count < kMaxDepth; count++ )
    {
        int off = kMaxDepth;
    	vec2 pt_n = pos;
        
        float l = len;
        float w = wid;
        
      	for( int i=1; i<=kDepth; i++ )
      	{
            l *= lenf;
            w *= widf;

            off /= kBranches; 
            int dec = c / off;
        	int path = dec - kBranches*(dec/kBranches); //  dec % kBranches
          
            mat3 mx;
	    	if( path == 0 )
           	{
		  		mx = matRotate(0.75 + 0.25*sin(u_time-1.0)) * matTranslate( 0.0,0.4*l/lenf);
	    	}
        	else if( path == 1 )
            {
          		mx = matRotate(-0.6 + 0.21*sin(u_time)) * matTranslate(0.0,0.6*l/lenf);
	    	}
	    	else
            {
          		mx = matRotate(0.23*sin(u_time+1.)) * matTranslate(0.0,1.0*l/lenf);
	    	}
            
            pt_n = (mx * vec3(pt_n,1)).xy;

            
        
        	// bounding sphere test
            float y = length( pt_n - vec2(0.0, l) );
            #ifdef TRUE_DISTANCE
            if( y-1.4*l > d   ) { c += off-1; break; }
            #else
       		if( y-1.4*l > 0.0 ) { c += off-1; break; }
            #endif

            
            d = min( d, sdBranch( pt_n, w, w*widf, l ) );
     	}
        
    	c++;
    	if( c > kMaxDepth ) break;
	}
    
   	return d;
}


void main( )
{
    // coordinate system
    vec2  uv = TexCoords;//(-u_resolution.xy + 2.0*fragCoord.xy) / u_resolution.y;
    uv = (uv*2 - 1);
    float px = 2.0/u_resolution.y;

    vec4 fragColor = vec4(1);

    // frame in screen
    uv = uv*4.0 + vec2(0.0,3.5);
    px = px*4.0;
   
    
    // compute
    float d = map( uv );
    
    
    // shape
    vec3 cola = vec3( smoothstep( 0.0, 2.0*px, d ) );
    
    // distance field
    vec3 colb = vec3( pow(abs(d),0.4)*0.5 + 0.015*sin( 40.0*d ) );
    
   	// derivatives
    #if 1
        vec2 der = vec2( dFdx(d), dFdy(d) )/px;
    #else
        float eps = 0.1/u_resolution.y;
        vec2 der = vec2( map(uv+vec2(eps,0.0))-d,map(uv+vec2(0.0,eps))-d) /eps;
    #endif
    vec3 colc = vec3(0.5+0.5*der.x,0.5+0.5*der.y,0.0) * clamp(abs(d)*8.0+0.2,0.0,1.0);
      

    // final color
    float t = fract( 0.2 + u_time/11.0 );    
    
    vec3 col = mix( colc, cola, smoothstep( 0.00, 0.05, t ) );
         col = mix( col , colb, smoothstep( 0.30, 0.35, t ) );
         col = mix( col , colc, smoothstep( 0.60, 0.65, t ) );
    
    fragColor = vec4( col, 1.0 );
    FragColor = fragColor;
}