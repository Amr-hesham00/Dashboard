using Dashboard.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Infrastructure;
public class GenericRepo<T> : IGenericRepo<T> where T : class//, IHasUserId, IHasMerchantId
{
    // context and dbSet = protected =>  So child repositories can use them.
    protected AppDbContext context;
    protected DbSet<T> dbset; // Dbset<Product>
    public GenericRepo(AppDbContext context)
    {
        this.context = context;
        dbset = context.Set<T>(); // give me: DbSet<Products> (for ex)
    }

    public async Task Create(T entity)
    {
        await dbset.AddAsync(entity);
    }
    public void Update(T entity)
    {
        dbset.Update(entity);
    }
    public void Delete(T entity)
    {
        dbset.Remove(entity);
    }
    public async Task Save()
    {
        await context.SaveChangesAsync();
    }
    public async Task<List<T>> GetAll(T entity)
    {
        return await dbset.ToListAsync();
    }

    public virtual async Task<T?> GetById(int id)
    {
        return await dbset.FindAsync(id); // return entity or null
    }


}
