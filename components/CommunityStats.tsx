const CommunityStats = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Growing Community Impact
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of cloud-native enthusiasts across Sri Lanka
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">1,500+</div>
            <div className="text-muted-foreground">Community Members</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">25+</div>
            <div className="text-muted-foreground">Events Hosted</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">50+</div>
            <div className="text-muted-foreground">Mentorship Connections</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">15+</div>
            <div className="text-muted-foreground">University Partners</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityStats;