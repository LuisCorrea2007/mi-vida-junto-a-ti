/** Fetches every row in a year, across Supabase's default per-request row cap. */
export type AlbumPageResponse<T>={ data:T[]|null; error:{message:string}|null };
export async function collectAlbumPages<T>(
  fetchPage:(from:number,to:number)=>PromiseLike<AlbumPageResponse<T>>,
  pageSize=200,
  maxPages=250,
):Promise<T[]> {
  if(!Number.isInteger(pageSize)||pageSize<1||pageSize>1000)throw new Error("Tamaño de página inválido");
  const all:T[]=[];
  for(let page=0;page<maxPages;page++){
    const {data,error}=await fetchPage(page*pageSize,(page+1)*pageSize-1);
    if(error)throw new Error(error.message);
    const batch=data??[];
    all.push(...batch);
    if(batch.length<pageSize)return all;
  }
  throw new Error("El álbum contiene demasiados elementos. Selecciona otro año o divide el archivo.");
}
