using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;

namespace Dashboard.Infrastructure.Repositories;
public class CampaignRepo : GenericRepo<Campaign>, ICampaignRepo
{
    public CampaignRepo(AppDbContext context) : base(context)
    {
    }
}
