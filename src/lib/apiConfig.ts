export function getApiUrl(role: 'admin'){
    switch(role){
        case 'admin' :
            return process.env.NEXT_PUBLIC_URL
        default:
            return process.env.NEXT_PUBLIC_API_URL
    }
        
    
    
}