import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('access_token');
    const isApiUrl = req.url.startsWith(environment.apiUrl);

    if (token && isApiUrl && token.includes('.') && token !== 'undefined' && token !== 'null') {
        console.log(`[JWT Interceptor] Anexando token para: ${req.url}`);
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    } else if (token && isApiUrl) {
        console.error(`[JWT Interceptor] Ignorando token invalido/malformado para: ${req.url}`, token);
    } else if (!token && isApiUrl) {
        console.warn(`[JWT Interceptor] Nao ha token para requisicao API: ${req.url}`);
    }

    return next(req);
};
