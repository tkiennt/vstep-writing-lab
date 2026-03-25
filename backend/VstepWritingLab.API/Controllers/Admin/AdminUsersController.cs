using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VstepWritingLab.Shared.Models.DTOs.Requests;
using VstepWritingLab.Business.Services;

namespace VstepWritingLab.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = "admin")]
    public class AdminUsersController : ControllerBase
    {
        private readonly AdminUserService _adminUserService;

        public AdminUsersController(AdminUserService adminUserService)
        {
            _adminUserService = adminUserService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
        {
            var user = await _adminUserService.CreateUserAsync(request);
            return CreatedAtAction(nameof(GetAll), new { id = user.UserId }, user);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _adminUserService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(
            string id,
            [FromBody] UpdateUserRequest request)
        {
            var updated = await _adminUserService.UpdateUserAsync(id, request);
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _adminUserService.DeleteUserAsync(id);
            return NoContent();
        }
    }
}
