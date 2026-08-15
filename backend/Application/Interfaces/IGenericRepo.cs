namespace Dashboard.Application.Interfaces;
public interface IGenericRepo<T> where T : class
{
    public Task Create(T var);
    public void Update(T var);
    public void Delete(T var);
    public Task Save();
    public Task<List<T>> GetAll(T var);
    public Task<T?> GetById(int id);
}
